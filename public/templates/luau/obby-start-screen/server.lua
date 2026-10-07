--[[
    Obby Start Screen - Server Script
    Manages player data, shop, leaderboard, and game sessions.
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")

-- ============================================================
-- DATA STORES
-- ============================================================
local playerDataStore = DataStoreService:GetDataStore("Obby_PlayerData_v1")
local leaderboardStore = DataStoreService:GetOrderedDataStore("Obby_Leaderboard_v1")

-- ============================================================
-- REMOTE EVENTS SETUP
-- ============================================================
local remotesFolder = Instance.new("Folder")
remotesFolder.Name = "Obby_StartScreen_Remotes"
remotesFolder.Parent = ReplicatedStorage

local remoteNames = {
    "RequestPlayerData",
    "PlayerData",
    "StartGame",
    "OpenShop",
    "PurchaseItem",
    "OpenRules",
    "UpdateSettings",
    "InviteFriend",
}

for _, name in ipairs(remoteNames) do
    local remote = Instance.new("RemoteEvent")
    remote.Name = name
    remote.Parent = remotesFolder
end

-- Remote references
local requestPlayerDataRemote = remotesFolder.RequestPlayerData
local playerDataRemote = remotesFolder.PlayerData
local startGameRemote = remotesFolder.StartGame
local openShopRemote = remotesFolder.OpenShop
local purchaseItemRemote = remotesFolder.PurchaseItem
local openRulesRemote = remotesFolder.OpenRules
local updateSettingsRemote = remotesFolder.UpdateSettings
local inviteFriendRemote = remotesFolder.InviteFriend

-- ============================================================
-- CONFIGURATION
-- ============================================================
local CONFIG = {
    STARTING_LEVEL = 1,
    BASE_REWARD = 50,
    TIME_BONUS_MULTIPLIER = 10,
    LEADERBOARD_SIZE = 50,
    AUTO_SAVE_INTERVAL = 120,
}

-- ============================================================
-- SHOP ITEMS
-- ============================================================
local SHOP_ITEMS = {
    SpeedBoost = { name = "Speed Boost", price = 150, duration = 30, effect = "speed" },
    JumpBoost = { name = "Jump Boost", price = 200, duration = 30, effect = "jump" },
    Shield = { name = "Shield", price = 300, duration = 60, effect = "shield" },
    Checkpoint = { name = "Checkpoint", price = 100, duration = 0, effect = "checkpoint" },
    Magnet = { name = "Magnet", price = 250, duration = 45, effect = "magnet" },
    Gravity = { name = "Low Gravity", price = 400, duration = 30, effect = "gravity" },
}

-- ============================================================
-- PLAYER SESSION MANAGEMENT
-- ============================================================
local playerSessions = {}

local function createDefaultSession()
    return {
        currency = 0,
        bestTime = 0,
        currentLevel = 1,
        highestLevel = 1,
        totalAttempts = 0,
        successfulRuns = 0,
        ownedItems = {},
        settings = {
            music = true,
            sfx = true,
            difficulty = "normal",
        },
        stats = {
            totalPlayTime = 0,
            totalCoinsEarned = 0,
            falls = 0,
            starsCollected = 0,
        },
        isPlaying = false,
        currentRunStart = 0,
        currentRunTime = 0,
    }
end

local function loadPlayerData(player)
    local success, data = pcall(function()
        return playerDataStore:GetAsync("Obby_" .. player.UserId)
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
        bestTime = session.bestTime,
        currentLevel = session.currentLevel,
        highestLevel = session.highestLevel,
        totalAttempts = session.totalAttempts,
        successfulRuns = session.successfulRuns,
        ownedItems = session.ownedItems,
        settings = session.settings,
        stats = session.stats,
    }

    local success, err = pcall(function()
        playerDataStore:SetAsync("Obby_" .. player.UserId, data)
    end)

    if not success then
        warn("[Obby Start Screen] Failed to save data for " .. player.Name .. ": " .. tostring(err))
    end
end

-- ============================================================
-- GAME FUNCTIONS
-- ============================================================

local function startGame(player)
    local session = playerSessions[player]
    if not session then return end
    if session.isPlaying then return end

    session.isPlaying = true
    session.totalAttempts += 1
    session.currentRunStart = tick()

    -- Teleport player to start position
    local character = player.Character
    if character then
        local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
        if humanoidRootPart then
            -- Find spawn location for current level
            local spawnLocation = workspace:FindFirstChild("Level" .. session.currentLevel .. "_Spawn")
            if spawnLocation then
                humanoidRootPart.CFrame = spawnLocation.CFrame + Vector3.new(0, 5, 0)
            end
        end
    end

    -- Notify client to hide menu
    startGameRemote:FireClient(player, {
        level = session.currentLevel,
        difficulty = session.settings.difficulty,
    })
end

local function completeLevel(player, level, time, stars)
    local session = playerSessions[player]
    if not session then return end
    if not session.isPlaying then return end

    session.isPlaying = false
    session.currentRunTime = time
    session.successfulRuns += 1
    session.stats.starsCollected += (stars or 0)

    -- Calculate rewards
    local timeBonus = math.max(0, math.floor((120 - time) * CONFIG.TIME_BONUS_MULTIPLIER))
    local starBonus = (stars or 0) * 25
    local baseReward = CONFIG.BASE_REWARD * level
    local totalReward = baseReward + timeBonus + starBonus

    session.currency += totalReward
    session.stats.totalCoinsEarned += totalReward

    -- Update best time
    if session.bestTime == 0 or time < session.bestTime then
        session.bestTime = time
    end

    -- Advance level
    if level >= session.currentLevel then
        session.currentLevel = level + 1
        if session.currentLevel > session.highestLevel then
            session.highestLevel = session.currentLevel
        end
    end

    -- Save to leaderboard
    pcall(function()
        leaderboardStore:SetAsync(tostring(player.UserId), session.bestTime)
    end)

    -- Save data
    savePlayerData(player, session)

    -- Send completion data to client
    playerDataRemote:FireClient(player, {
        bestTime = session.bestTime,
        currentLevel = session.currentLevel,
        totalAttempts = session.totalAttempts,
        currency = session.currency,
        reward = totalReward,
        completed = true,
    })
end

local function purchaseItem(player, itemName)
    local session = playerSessions[player]
    if not session then return end

    local item = SHOP_ITEMS[itemName]
    if not item then
        warn("[Obby Start Screen] Unknown item: " .. tostring(itemName))
        return
    end

    if session.currency < item.price then
        return -- Not enough currency
    end

    -- Check if already owned (for permanent items)
    if item.effect == "checkpoint" then
        if table.find(session.ownedItems, itemName) then
            return
        end
    end

    session.currency -= item.price

    -- Add to owned items
    if item.effect == "checkpoint" then
        table.insert(session.ownedItems, itemName)
    end

    savePlayerData(player, session)

    -- Send updated data
    playerDataRemote:FireClient(player, {
        currency = session.currency,
        ownedItems = session.ownedItems,
    })
end

-- ============================================================
-- EVENT CONNECTIONS
-- ============================================================

Players.PlayerAdded:Connect(function(player)
    local savedData = loadPlayerData(player)
    local session = createDefaultSession()

    if savedData then
        session.currency = savedData.currency or 0
        session.bestTime = savedData.bestTime or 0
        session.currentLevel = savedData.currentLevel or 1
        session.highestLevel = savedData.highestLevel or 1
        session.totalAttempts = savedData.totalAttempts or 0
        session.successfulRuns = savedData.successfulRuns or 0
        session.ownedItems = savedData.ownedItems or {}
        session.settings = savedData.settings or session.settings
        session.stats = savedData.stats or session.stats
    end

    playerSessions[player] = session
end)

Players.PlayerRemoving:Connect(function(player)
    local session = playerSessions[player]
    if session then
        savePlayerData(player, session)
        playerSessions[player] = nil
    end
end)

-- Request player data
requestPlayerDataRemote.OnServerEvent:Connect(function(player)
    local session = playerSessions[player]
    if not session then return end

    playerDataRemote:FireClient(player, {
        bestTime = session.bestTime,
        currentLevel = session.currentLevel,
        totalAttempts = session.totalAttempts,
        currency = session.currency,
        musicEnabled = session.settings.music,
        sfxEnabled = session.settings.sfx,
        difficulty = session.settings.difficulty,
        hasContinue = session.isPlaying,
    })
end)

-- Start game
startGameRemote.OnServerEvent:Connect(function(player)
    startGame(player)
end)

-- Purchase item
purchaseItemRemote.OnServerEvent:Connect(function(player, itemName)
    purchaseItem(player, itemName)
end)

-- Update settings
updateSettingsRemote.OnServerEvent:Connect(function(player, setting, value)
    local session = playerSessions[player]
    if not session then return end

    session.settings[setting] = value
    savePlayerData(player, session)
end)

-- Invite friend
inviteFriendRemote.OnServerEvent:Connect(function(player)
    -- Trigger Roblox invite prompt
    local success, result = pcall(function()
        -- In a real implementation, use SocialService
        -- local SocialService = game:GetService("SocialService")
        -- SocialService:PromptInviteRequested(player)
    end)
end)

-- ============================================================
-- LEVEL COMPLETION DETECTOR
-- ============================================================

-- Detect when player reaches level end
if workspace:FindFirstChild("LevelEnds") then
    for _, endPart in ipairs(workspace.LevelEnds:GetChildren()) do
        if endPart:IsA("BasePart") then
            endPart.Touched:Connect(function(hit)
                local character = hit.Parent
                if not character then return end

                local player = Players:GetPlayerFromCharacter(character)
                if not player then return end

                local session = playerSessions[player]
                if not session or not session.isPlaying then return end

                local levelNum = tonumber(endPart.Name:match("%d+"))
                if not levelNum then return end

                local runTime = tick() - session.currentRunStart
                completeLevel(player, levelNum, runTime, 3) -- 3 stars for now
            end)
        end
    end
end

-- ============================================================
-- AUTO-SAVE LOOP
-- ============================================================

task.spawn(function()
    while true do
        task.wait(CONFIG.AUTO_SAVE_INTERVAL)
        for player, session in pairs(playerSessions) do
            pcall(function()
                savePlayerData(player, session)
            end)
        end
    end
end)

-- ============================================================
-- SHUTDOWN HANDLER
-- ============================================================

game:BindToClose(function()
    for player, session in pairs(playerSessions) do
        pcall(function()
            savePlayerData(player, session)
        end)
    end
end)

print("[Obby Start Screen Server] Initialized successfully")
