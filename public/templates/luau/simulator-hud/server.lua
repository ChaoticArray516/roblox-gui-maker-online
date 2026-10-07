--[[
    Simulator HUD - Server Script
    Manages clicker game logic, currency, rebirths, pets, and data persistence.
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")

-- ============================================================
-- DATA STORES
-- ============================================================
local playerDataStore = DataStoreService:GetDataStore("Simulator_PlayerData_v2")
local leaderboardDataStore = DataStoreService:GetOrderedDataStore("Simulator_Leaderboard_v1")

-- ============================================================
-- REMOTE EVENTS SETUP
-- ============================================================
local remotesFolder = Instance.new("Folder")
remotesFolder.Name = "Simulator_HUD_Remotes"
remotesFolder.Parent = ReplicatedStorage

local remoteNames = {
    "UpdateCurrency",
    "UpdateClicks",
    "UpdateRebirths",
    "UpdatePets",
    "UpdateMultiplier",
    "Click",
    "ShowNotification",
    "ShowFloatingText",
    "UpdateLeaderboard",
    "OpenMenu",
}

for _, name in ipairs(remoteNames) do
    local remote = Instance.new("RemoteEvent")
    remote.Name = name
    remote.Parent = remotesFolder
end

-- Remote references
local updateCurrencyRemote = remotesFolder.UpdateCurrency
local updateClicksRemote = remotesFolder.UpdateClicks
local updateRebirthsRemote = remotesFolder.UpdateRebirths
local updatePetsRemote = remotesFolder.UpdatePets
local updateMultiplierRemote = remotesFolder.UpdateMultiplier
local clickRemote = remotesFolder.Click
local showNotificationRemote = remotesFolder.ShowNotification
local showFloatingTextRemote = remotesFolder.ShowFloatingText
local updateLeaderboardRemote = remotesFolder.UpdateLeaderboard
local openMenuRemote = remotesFolder.OpenMenu

-- ============================================================
-- CONFIGURATION
-- ============================================================
local CONFIG = {
    BASE_CLICK_VALUE = 1,
    REBIRTH_COST_MULTIPLIER = 1e6, -- 1M per rebirth level
    REBIRTH_MULTIPLIER_BONUS = 0.5, -- +0.5x per rebirth
    MAX_PETS = 100,
    LEADERBOARD_UPDATE_INTERVAL = 60,
    AUTO_SAVE_INTERVAL = 120,
}

-- ============================================================
-- PLAYER SESSION MANAGEMENT
-- ============================================================
local playerSessions = {}

local function createDefaultSession()
    return {
        currency = 0,
        totalClicks = 0,
        sessionClicks = 0,
        rebirths = 0,
        pets = {},
        equippedPets = {},
        petCapacity = 100,
        multiplier = 1.0,
        clickValue = CONFIG.BASE_CLICK_VALUE,
        upgrades = {
            clickPower = 1,
            autoClicker = 0,
            criticalChance = 0,
        },
        stats = {
            bestCurrency = 0,
            totalRebirths = 0,
            playTime = 0,
        },
        lastClickTime = 0,
        clicksThisSecond = 0,
    }
end

local function loadPlayerData(player)
    local success, data = pcall(function()
        return playerDataStore:GetAsync("Player_" .. player.UserId)
    end)

    if success and data then
        return data
    end
    return nil
end

local function savePlayerData(player, session)
    if not session then return end

    local data = {
        currency = session.currency,
        totalClicks = session.totalClicks,
        rebirths = session.rebirths,
        pets = session.pets,
        equippedPets = session.equippedPets,
        upgrades = session.upgrades,
        stats = session.stats,
    }

    local success, err = pcall(function()
        playerDataStore:SetAsync("Player_" .. player.UserId, data)
    end)

    if not success then
        warn("[Simulator HUD] Failed to save data for " .. player.Name .. ": " .. tostring(err))
    end
end

-- ============================================================
-- CALCULATION FUNCTIONS
-- ============================================================

local function calculateMultiplier(session)
    local base = 1.0
    local rebirthBonus = session.rebirths * CONFIG.REBIRTH_MULTIPLIER_BONUS
    local petBonus = 0

    for _, pet in ipairs(session.equippedPets) do
        petBonus += (pet.multiplier or 0)
    end

    local upgradeBonus = (session.upgrades.clickPower - 1) * 0.5

    session.multiplier = base + rebirthBonus + petBonus + upgradeBonus
    return session.multiplier
end

local function calculateClickValue(session)
    local value = CONFIG.BASE_CLICK_VALUE * session.upgrades.clickPower
    return math.floor(value * session.multiplier)
end

local function getRebirthCost(session)
    return math.floor(CONFIG.REBIRTH_COST_MULTIPLIER * (session.rebirths + 1))
end

local function getRebirthProgress(session)
    local cost = getRebirthCost(session)
    return math.clamp(session.currency / cost, 0, 1)
end

-- ============================================================
-- SYNC FUNCTIONS
-- ============================================================

local function syncCurrency(player)
    local session = playerSessions[player]
    if not session then return end
    updateCurrencyRemote:FireClient(player, session.currency)
end

local function syncClicks(player)
    local session = playerSessions[player]
    if not session then return end
    updateClicksRemote:FireClient(player, session.totalClicks)
end

local function syncRebirths(player)
    local session = playerSessions[player]
    if not session then return end
    updateRebirthsRemote:FireClient(player, session.rebirths)
end

local function syncPets(player)
    local session = playerSessions[player]
    if not session then return end
    updatePetsRemote:FireClient(player, #session.equippedPets, session.petCapacity)
end

local function syncMultiplier(player)
    local session = playerSessions[player]
    if not session then return end
    calculateMultiplier(session)
    updateMultiplierRemote:FireClient(player, session.multiplier)
end

local function syncProgress(player)
    local session = playerSessions[player]
    if not session then return end
    local progress = getRebirthProgress(session)
    -- Send via a custom remote or include in existing update
end

-- ============================================================
-- GAMEPLAY FUNCTIONS
-- ============================================================

local function processClick(player)
    local session = playerSessions[player]
    if not session then return end

    local now = tick()

    -- Anti-autoclick: max 20 clicks per second
    if now - session.lastClickTime >= 1 then
        session.clicksThisSecond = 0
    end
    session.clicksThisSecond += 1

    if session.clicksThisSecond > 20 then
        return -- Silently ignore excessive clicks
    end

    session.lastClickTime = now

    -- Calculate earnings
    local earned = calculateClickValue(session)

    -- Critical hit chance (up to 10%)
    local isCritical = math.random() < (session.upgrades.criticalChance * 0.01)
    if isCritical then
        earned = earned * 2
    end

    -- Apply earnings
    session.currency += earned
    session.totalClicks += 1
    session.sessionClicks += 1

    if session.currency > session.stats.bestCurrency then
        session.stats.bestCurrency = session.currency
    end

    -- Sync to client
    syncCurrency(player)
    syncClicks(player)

    -- Show floating text
    local text = isCritical and "CRIT! +" .. earned or "+" .. earned
    showFloatingTextRemote:FireClient(player, text, UDim2.fromScale(0.5 + math.random(-10, 10) / 100, 0.6), CONFIG.COIN_GOLD)

    -- Check milestones
    if session.totalClicks == 100 then
        showNotificationRemote:FireClient(player, "Milestone: 100 clicks!", "success")
    elseif session.totalClicks == 1000 then
        showNotificationRemote:FireClient(player, "Milestone: 1,000 clicks! Amazing!", "success")
    end

    -- Check rebirth progress
    local progress = getRebirthProgress(session)
    if progress >= 1 then
        showNotificationRemote:FireClient(player, "You can rebirth now!", "rebirth")
    end
end

local function performRebirth(player)
    local session = playerSessions[player]
    if not session then return end

    local cost = getRebirthCost(session)
    if session.currency < cost then
        showNotificationRemote:FireClient(player, "Not enough coins to rebirth!", "error")
        return
    end

    -- Deduct currency
    session.currency = 0
    session.rebirths += 1
    session.stats.totalRebirths += 1
    session.totalClicks = 0

    -- Recalculate multiplier
    calculateMultiplier(session)

    -- Sync
    syncCurrency(player)
    syncRebirths(player)
    syncMultiplier(player)
    syncClicks(player)

    showNotificationRemote:FireClient(player, "Rebirth complete! Multiplier increased!", "rebirth")
end

local function equipPet(player, petId)
    local session = playerSessions[player]
    if not session then return end

    local pet = nil
    for _, p in ipairs(session.pets) do
        if p.id == petId then
            pet = p
            break
        end
    end

    if not pet then
        showNotificationRemote:FireClient(player, "Pet not found!", "error")
        return
    end

    -- Check if already equipped
    for _, ep in ipairs(session.equippedPets) do
        if ep.id == petId then
            return -- Already equipped
        end
    end

    -- Check capacity
    if #session.equippedPets >= session.petCapacity then
        showNotificationRemote:FireClient(player, "Pet capacity full! Upgrade to equip more.", "warning")
        return
    end

    table.insert(session.equippedPets, pet)
    syncPets(player)
    syncMultiplier(player)

    showNotificationRemote:FireClient(player, "Equipped " .. pet.name .. "!", "success")
end

local function addPet(player, petData)
    local session = playerSessions[player]
    if not session then return end

    table.insert(session.pets, petData)

    -- Auto-equip if space available
    if #session.equippedPets < session.petCapacity then
        table.insert(session.equippedPets, petData)
        syncPets(player)
        syncMultiplier(player)
    end

    showNotificationRemote:FireClient(player, "You got " .. petData.name .. "!", "success")
end

-- ============================================================
-- LEADERBOARD FUNCTIONS
-- ============================================================

local function updateLeaderboard()
    local success, pages = pcall(function()
        return leaderboardDataStore:GetSortedAsync(false, 50)
    end)

    if not success or not pages then return end

    local data = {}
    local page = pages:GetCurrentPage()
    for rank, entry in ipairs(page) do
        local userId = tonumber(entry.key)
        local value = entry.value

        local name = "Unknown"
        pcall(function()
            local player = Players:GetPlayerByUserId(userId)
            if player then
                name = player.Name
            else
                name = Players:GetNameFromUserIdAsync(userId)
            end
        end)

        table.insert(data, {
            rank = rank,
            name = name,
            score = value,
        })
    end

    -- Broadcast to all players
    for _, player in ipairs(Players:GetPlayers()) do
        updateLeaderboardRemote:FireClient(player, data)
    end
end

local function saveToLeaderboard(player, session)
    if not session then return end
    pcall(function()
        leaderboardDataStore:SetAsync(tostring(player.UserId), session.currency)
    end)
end

-- ============================================================
-- EVENT CONNECTIONS
-- ============================================================

Players.PlayerAdded:Connect(function(player)
    local savedData = loadPlayerData(player)
    local session = createDefaultSession()

    if savedData then
        session.currency = savedData.currency or 0
        session.totalClicks = savedData.totalClicks or 0
        session.rebirths = savedData.rebirths or 0
        session.pets = savedData.pets or {}
        session.equippedPets = savedData.equippedPets or {}
        session.upgrades = savedData.upgrades or session.upgrades
        session.stats = savedData.stats or session.stats
    end

    calculateMultiplier(session)
    playerSessions[player] = session

    -- Wait for character and client
    task.wait(2)

    -- Initial sync
    syncCurrency(player)
    syncClicks(player)
    syncRebirths(player)
    syncPets(player)
    syncMultiplier(player)
end)

Players.PlayerRemoving:Connect(function(player)
    local session = playerSessions[player]
    if session then
        savePlayerData(player, session)
        saveToLeaderboard(player, session)
        playerSessions[player] = nil
    end
end)

-- Click handler
clickRemote.OnServerEvent:Connect(function(player)
    processClick(player)
end)

-- Menu handler
openMenuRemote.OnServerEvent:Connect(function(player, menuName)
    -- Server-side menu validation and opening
    print(player.Name .. " opened menu: " .. tostring(menuName))
end)

-- ============================================================
-- AUTO SYSTEMS
-- ============================================================

-- Auto-save loop
task.spawn(function()
    while true do
        task.wait(CONFIG.AUTO_SAVE_INTERVAL)
        for player, session in pairs(playerSessions) do
            pcall(function()
                savePlayerData(player, session)
                saveToLeaderboard(player, session)
            end)
        end
        print("[Simulator HUD] Auto-saved all player data")
    end
end)

-- Leaderboard update loop
task.spawn(function()
    while true do
        task.wait(CONFIG.LEADERBOARD_UPDATE_INTERVAL)
        updateLeaderboard()
    end
end)

-- ============================================================
-- SHUTDOWN HANDLER
-- ============================================================

game:BindToClose(function()
    for player, session in pairs(playerSessions) do
        pcall(function()
            savePlayerData(player, session)
            saveToLeaderboard(player, session)
        end)
    end
end)

print("[Simulator HUD Server] Initialized successfully")
