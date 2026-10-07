--[[
    Main Menu System - Server
    Features: Player spawn control, code redemption, data persistence
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")
local MemoryStoreService = game:GetService("MemoryStoreService")

-- DataStore
local PlayerDataStore = DataStoreService:GetDataStore("MainMenuData_v1")
local CodeRedemptions = DataStoreService:GetDataStore("CodeRedemptions_v1")

-- Create Remote Events
local Remotes = Instance.new("Folder")
Remotes.Name = "MenuRemotes"
Remotes.Parent = ReplicatedStorage

local SpawnPlayer = Instance.new("RemoteEvent")
SpawnPlayer.Name = "SpawnPlayer"
SpawnPlayer.Parent = Remotes

local ValidateCode = Instance.new("RemoteFunction")
ValidateCode.Name = "ValidateCode"
ValidateCode.Parent = Remotes

local ShowStore = Instance.new("RemoteEvent")
ShowStore.Name = "ShowStore"
ShowStore.Parent = Remotes

-- ============================================
-- CONFIGURATION
-- ============================================
local SERVER_CONFIG = {
    SpawnLocation = CFrame.new(0, 10, 0),
    StarterCoins = 100,
    MaxCodeUses = 1000, -- Global max uses per code
}

-- Redeemable codes configuration
local REDEEM_CODES = {
    ["WELCOME2024"] = {
        Rewards = {Coins = 500, Gems = 50},
        MaxUses = 10000,
        ExpiresAt = nil, -- No expiration
    },
    ["RELEASE"] = {
        Rewards = {Coins = 1000, Gems = 100, Item = "Launch Hat"},
        MaxUses = 5000,
        ExpiresAt = nil,
    },
    ["UPDATE1"] = {
        Rewards = {Coins = 250, Gems = 25},
        MaxUses = 2000,
        ExpiresAt = 1735689600, -- Unix timestamp
    },
}

-- ============================================
-- PLAYER DATA
-- ============================================
local PlayerData = {}

local function GetDefaultData()
    return {
        Coins = SERVER_CONFIG.StarterCoins,
        Gems = 0,
        Inventory = {},
        Equipped = {},
        CodesRedeemed = {},
        Settings = {
            MusicEnabled = true,
            SFXEnabled = true,
            GraphicsQuality = "High",
        },
        FirstJoin = true,
        JoinTime = os.time(),
    }
end

local function LoadPlayerData(player)
    local success, data = pcall(function()
        return PlayerDataStore:GetAsync(tostring(player.UserId))
    end)

    if success and data then
        data.FirstJoin = false
        PlayerData[player] = data
    else
        PlayerData[player] = GetDefaultData()
    end
end

local function SavePlayerData(player)
    local data = PlayerData[player]
    if not data then return end

    local success, err = pcall(function()
        PlayerDataStore:SetAsync(tostring(player.UserId), data)
    end)

    if not success then
        warn("Failed to save data for " .. player.Name .. ": " .. tostring(err))
    end
end

-- ============================================
-- PLAYER SPAWN CONTROL
-- ============================================
local SpawnedPlayers = {}

SpawnPlayer.OnServerEvent:Connect(function(player)
    if SpawnedPlayers[player] then return end -- Already spawned
    SpawnedPlayers[player] = true

    local character = player.Character
    if not character then return end

    local humanoidRootPart = character:WaitForChild("HumanoidRootPart")
    local humanoid = character:WaitForChild("Humanoid")

    -- Unfreeze and enable movement
    humanoidRootPart.Anchored = false
    humanoidRootPart.CFrame = SERVER_CONFIG.SpawnLocation
    humanoid.WalkSpeed = 16
    humanoid.JumpPower = 50

    print(player.Name .. " has spawned into the game!")
end)

-- ============================================
-- CODE REDEMPTION
-- ============================================
ValidateCode.OnServerInvoke = function(player, code)
    if not code or type(code) ~= "string" then
        return {Success = false, Message = "Invalid code format"}
    end

    code = string.upper(string.gsub(code, "^%s*(.-)%s*$", "%1"))

    local config = REDEEM_CODES[code]
    if not config then
        return {Success = false, Message = "Code not found"}
    end

    -- Check expiration
    if config.ExpiresAt and os.time() > config.ExpiresAt then
        return {Success = false, Message = "Code has expired"}
    end

    -- Check if player already redeemed
    local data = PlayerData[player]
    if not data then
        return {Success = false, Message = "Data not loaded"}
    end

    if data.CodesRedeemed[code] then
        return {Success = false, Message = "Already redeemed"}
    end

    -- Check global usage count
    local success, uses = pcall(function()
        return CodeRedemptions:GetAsync(code) or 0
    end)

    if not success then
        return {Success = false, Message = "Server error"}
    end

    if uses >= config.MaxUses then
        return {Success = false, Message = "Code max uses reached"}
    end

    -- Redeem the code
    local redeemSuccess = pcall(function()
        CodeRedemptions:SetAsync(code, uses + 1)
    end)

    if not redeemSuccess then
        return {Success = false, Message = "Redemption failed"}
    end

    -- Grant rewards
    data.CodesRedeemed[code] = true
    if config.Rewards.Coins then
        data.Coins = data.Coins + config.Rewards.Coins
    end
    if config.Rewards.Gems then
        data.Gems = data.Gems + config.Rewards.Gems
    end
    if config.Rewards.Item then
        table.insert(data.Inventory, {
            Name = config.Rewards.Item,
            Type = "Cosmetic",
            Obtained = os.time(),
        })
    end

    -- Save immediately
    SavePlayerData(player)

    return {
        Success = true,
        Message = "Code redeemed!",
        Rewards = config.Rewards,
    }
end

-- ============================================
-- PLAYER LIFECYCLE
-- ============================================
Players.PlayerAdded:Connect(function(player)
    LoadPlayerData(player)

    -- Set starter GUI (disable default)
    local starterGui = player:WaitForChild("StarterGui")
    -- Let the MainMenuGui load

    print(player.Name .. " joined. First join: " .. tostring(PlayerData[player].FirstJoin))
end)

Players.PlayerRemoving:Connect(function(player)
    SavePlayerData(player)
    PlayerData[player] = nil
    SpawnedPlayers[player] = nil
end)

-- Auto-save loop
while true do
    task.wait(60)
    for _, player in ipairs(Players:GetPlayers()) do
        SavePlayerData(player)
    end
end
