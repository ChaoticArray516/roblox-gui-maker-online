--[[
    FPS HUD - Server Script
    Manages player data, weapon systems, health/ammo sync.
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")
local RunService = game:GetService("RunService")

-- ============================================================
-- DATA STORES
-- ============================================================
local playerDataStore = DataStoreService:GetDataStore("FPS_PlayerData_v1")

-- ============================================================
-- REMOTE EVENTS SETUP
-- ============================================================
local remotesFolder = Instance.new("Folder")
remotesFolder.Name = "FPS_HUD_Remotes"
remotesFolder.Parent = ReplicatedStorage

local remoteNames = {
    "UpdateHealth",
    "UpdateAmmo",
    "UpdateScore",
    "KillFeed",
    "HitMarker",
    "DamageIndicator",
    "Reload",
    "WeaponSwitch",
    "RequestWeaponSwitch",
    "RequestReload",
}

for _, name in ipairs(remoteNames) do
    local remote = Instance.new("RemoteEvent")
    remote.Name = name
    remote.Parent = remotesFolder
end

-- Remote references
local updateHealthRemote = remotesFolder.UpdateHealth
local updateAmmoRemote = remotesFolder.UpdateAmmo
local updateScoreRemote = remotesFolder.UpdateScore
local killFeedRemote = remotesFolder.KillFeed
local hitMarkerRemote = remotesFolder.HitMarker
local damageIndicatorRemote = remotesFolder.DamageIndicator
local reloadRemote = remotesFolder.Reload
local weaponSwitchRemote = remotesFolder.WeaponSwitch
local requestWeaponSwitchRemote = remotesFolder.RequestWeaponSwitch
local requestReloadRemote = remotesFolder.RequestReload

-- ============================================================
-- WEAPON CONFIGURATIONS
-- ============================================================
local WEAPONS = {
    ["Assault Rifle"] = {
        ammoMax = 30,
        fireRate = 0.1,
        reloadTime = 2.0,
        damage = 25,
        slot = 1,
    },
    ["Pistol"] = {
        ammoMax = 12,
        fireRate = 0.25,
        reloadTime = 1.2,
        damage = 20,
        slot = 2,
    },
    ["Shotgun"] = {
        ammoMax = 8,
        fireRate = 0.8,
        reloadTime = 2.5,
        damage = 60,
        slot = 1,
    },
    ["Sniper"] = {
        ammoMax = 5,
        fireRate = 1.2,
        reloadTime = 2.8,
        damage = 100,
        slot = 1,
    },
}

-- ============================================================
-- PLAYER DATA MANAGEMENT
-- ============================================================
local playerSessions = {}

local function createDefaultSession()
    return {
        health = 100,
        maxHealth = 100,
        score = 0,
        kills = 0,
        deaths = 0,
        currentWeapon = "Assault Rifle",
        weapons = {
            [1] = { name = "Assault Rifle", ammoCurrent = 30, ammoReserve = 120 },
            [2] = { name = "Pistol", ammoCurrent = 12, ammoReserve = 60 },
        },
        isReloading = false,
        lastFireTime = 0,
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
    local data = {
        score = session.score,
        kills = session.kills,
        deaths = session.deaths,
        weapons = session.weapons,
    }

    local success, err = pcall(function()
        playerDataStore:SetAsync("Player_" .. player.UserId, data)
    end)

    if not success then
        warn("[FPS HUD] Failed to save data for " .. player.Name .. ": " .. tostring(err))
    end
end

-- ============================================================
-- SYNC FUNCTIONS
-- ============================================================

local function syncHealth(player)
    local session = playerSessions[player]
    if not session then return end
    updateHealthRemote:FireClient(player, session.health, session.maxHealth)
end

local function syncAmmo(player)
    local session = playerSessions[player]
    if not session then return end
    local weapon = session.weapons[session.currentWeaponSlot]
    if weapon then
        updateAmmoRemote:FireClient(player, weapon.ammoCurrent, weapon.ammoReserve)
    end
end

local function syncScore(player)
    local session = playerSessions[player]
    if not session then return end
    updateScoreRemote:FireClient(player, session.score, session.kills, session.deaths)
end

-- ============================================================
-- GAMEPLAY FUNCTIONS
-- ============================================================

local function fireWeapon(player)
    local session = playerSessions[player]
    if not session then return end

    local weaponData = session.weapons[session.currentWeaponSlot]
    local weaponConfig = WEAPONS[weaponData.name]
    if not weaponConfig then return end

    -- Check reload
    if session.isReloading then return end

    -- Check fire rate
    local now = tick()
    if now - session.lastFireTime < weaponConfig.fireRate then return end
    session.lastFireTime = now

    -- Check ammo
    if weaponData.ammoCurrent <= 0 then
        -- Auto reload
        startReload(player)
        return
    end

    -- Consume ammo
    weaponData.ammoCurrent -= 1
    syncAmmo(player)

    -- Raycast for hit detection
    local character = player.Character
    if not character then return end

    local humanoidRootPart = character:FindFirstChild("HumanoidRootPart")
    if not humanoidRootPart then return end

    -- Simple raycast from camera direction
    -- In a real implementation, use the player's camera look vector
    local params = RaycastParams.new()
    params.FilterDescendantsInstances = { character }
    params.FilterType = Enum.RaycastFilterType.Blacklist

    -- This is a simplified hit detection - actual implementation would use client-reported aim
    -- For now, simulate hit detection
end

function startReload(player)
    local session = playerSessions[player]
    if not session then return end
    if session.isReloading then return end

    local weaponData = session.weapons[session.currentWeaponSlot]
    local weaponConfig = WEAPONS[weaponData.name]
    if not weaponConfig then return end

    if weaponData.ammoReserve <= 0 then return end
    if weaponData.ammoCurrent >= weaponConfig.ammoMax then return end

    session.isReloading = true
    reloadRemote:FireClient(player, weaponConfig.reloadTime)

    task.delay(weaponConfig.reloadTime, function()
        if not playerSessions[player] then return end

        local needed = weaponConfig.ammoMax - weaponData.ammoCurrent
        local available = math.min(needed, weaponData.ammoReserve)

        weaponData.ammoCurrent += available
        weaponData.ammoReserve -= available
        session.isReloading = false

        syncAmmo(player)
    end)
end

local function switchWeapon(player, slot)
    local session = playerSessions[player]
    if not session then return end

    local weaponData = session.weapons[slot]
    if not weaponData then return end

    session.currentWeaponSlot = slot
    session.isReloading = false

    weaponSwitchRemote:FireClient(player, slot, weaponData.name)
    syncAmmo(player)
end

local function handleHit(player, targetPlayer, damage)
    local session = playerSessions[player]
    if not session then return end

    -- Update target health
    local targetSession = playerSessions[targetPlayer]
    if targetSession then
        targetSession.health = math.max(0, targetSession.health - damage)
        syncHealth(targetPlayer)

        -- Send damage indicator to target
        damageIndicatorRemote:FireClient(targetPlayer, "Top")

        if targetSession.health <= 0 then
            -- Kill
            session.kills += 1
            session.score += 100
            targetSession.deaths += 1
            targetSession.health = targetSession.maxHealth

            syncScore(player)
            syncScore(targetPlayer)
            syncHealth(targetPlayer)

            -- Broadcast kill feed
            killFeedRemote:FireAllClients(player.Name, targetPlayer.Name, session.weapons[session.currentWeaponSlot].name)
        end
    end

    -- Send hit marker to attacker
    hitMarkerRemote:FireClient(player)
end

-- ============================================================
-- EVENT CONNECTIONS
-- ============================================================

Players.PlayerAdded:Connect(function(player)
    -- Load saved data or create new session
    local savedData = loadPlayerData(player)
    local session = createDefaultSession()

    if savedData then
        session.score = savedData.score or 0
        session.kills = savedData.kills or 0
        session.deaths = savedData.deaths or 0
        if savedData.weapons then
            for slot, weaponData in pairs(savedData.weapons) do
                if session.weapons[slot] then
                    session.weapons[slot].ammoCurrent = weaponData.ammoCurrent or session.weapons[slot].ammoCurrent
                    session.weapons[slot].ammoReserve = weaponData.ammoReserve or session.weapons[slot].ammoReserve
                end
            end
        end
    end

    session.currentWeaponSlot = 1
    playerSessions[player] = session

    -- Wait for character
    player.CharacterAdded:Connect(function(character)
        session.health = session.maxHealth
        session.isReloading = false

        task.wait(1) -- Wait for client UI to load
        syncHealth(player)
        syncAmmo(player)
        syncScore(player)
        weaponSwitchRemote:FireClient(player, 1, session.weapons[1].name)
    end)
end)

Players.PlayerRemoving:Connect(function(player)
    local session = playerSessions[player]
    if session then
        savePlayerData(player, session)
        playerSessions[player] = nil
    end
end)

-- Handle weapon switch requests
requestWeaponSwitchRemote.OnServerEvent:Connect(function(player, slot)
    if typeof(slot) == "number" and (slot == 1 or slot == 2) then
        switchWeapon(player, slot)
    end
end)

-- Handle reload requests
requestReloadRemote.OnServerEvent:Connect(function(player)
    startReload(player)
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

print("[FPS HUD Server] Initialized successfully")
