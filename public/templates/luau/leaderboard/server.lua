--[[
    Global Leaderboard - Server Side
    Handles OrderedDataStore operations and data distribution
    Features: Score saving, top 10 retrieval, anti-spam protection
]]

-- Services
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- DataStore (change scope for different leaderboards)
local LeaderboardStore = DataStoreService:GetOrderedDataStore("GlobalLeaderboard_v1")

-- Configuration
local MAX_ENTRIES = 10
local SAVE_COOLDOWN = 10 -- seconds between saves per player
local MINIMUM_SCORE = 0
local MAXIMUM_SCORE = 999999999999

-- Remote Events setup
local LeaderboardEvents = Instance.new("Folder")
LeaderboardEvents.Name = "LeaderboardEvents"
LeaderboardEvents.Parent = ReplicatedStorage

local RefreshEvent = Instance.new("RemoteEvent")
RefreshEvent.Name = "RefreshLeaderboard"
RefreshEvent.Parent = LeaderboardEvents

local GetLeaderboardData = Instance.new("RemoteFunction")
GetLeaderboardData.Name = "GetLeaderboardData"
GetLeaderboardData.Parent = LeaderboardEvents

-- Player save cooldowns
local playerSaveCooldowns = {}

-----------------------------------------------------------
-- Utility Functions
-----------------------------------------------------------

local function IsValidScore(score)
    return type(score) == "number"
        and score >= MINIMUM_SCORE
        and score <= MAXIMUM_SCORE
        and score == math.floor(score) -- Integer check
end

local function CanSave(player)
    local lastSave = playerSaveCooldowns[player.UserId]
    if not lastSave then return true end
    return (os.time() - lastSave) >= SAVE_COOLDOWN
end

-----------------------------------------------------------
-- Leaderboard Data Operations
-----------------------------------------------------------

local function GetTopPlayers()
    local success, pages = pcall(function()
        return LeaderboardStore:GetSortedAsync(false, MAX_ENTRIES)
    end)

    if not success then
        warn("[Leaderboard] Failed to get sorted data: " .. tostring(pages))
        return {}
    end

    local data = {}
    local page = pages:GetCurrentPage()

    for rank, entry in ipairs(page) do
        local userId = tonumber(entry.key)
        local score = entry.value

        -- Try to get player display name
        local displayName = "Player_" .. userId
        local playerName = "Unknown"

        -- Check if player is currently in-game
        local player = Players:GetPlayerByUserId(userId)
        if player then
            displayName = player.DisplayName
            playerName = player.Name
        else
            -- Try to get name from UserService
            pcall(function()
                local success2, result = pcall(function()
                    return Players:GetNameFromUserIdAsync(userId)
                end)
                if success2 then
                    playerName = result
                    displayName = result
                end
            end)
        end

        table.insert(data, {
            Rank = rank,
            UserId = userId,
            Name = playerName,
            DisplayName = displayName,
            Score = score,
        })
    end

    return data
end

local function SavePlayerScore(player, score)
    if not IsValidScore(score) then
        return false, "Invalid score value"
    end

    if not CanSave(player) then
        return false, "Save cooldown active"
    end

    local success, err = pcall(function()
        LeaderboardStore:SetAsync(tostring(player.UserId), score)
    end)

    if success then
        playerSaveCooldowns[player.UserId] = os.time()
        return true, "Score saved successfully"
    else
        warn("[Leaderboard] Failed to save score for " .. player.Name .. ": " .. tostring(err))
        return false, "DataStore error"
    end
end

local function GetPlayerRank(player)
    local userId = tostring(player.UserId)

    local success, score = pcall(function()
        return LeaderboardStore:GetAsync(userId)
    end)

    if not success or not score then
        return nil, 0
    end

    -- Count how many players have a higher score
    local rankSuccess, pages = pcall(function()
        return LeaderboardStore:GetSortedAsync(false, 100)
    end)

    if not rankSuccess then
        return nil, score
    end

    local rank = 1
    local page = pages:GetCurrentPage()
    for _, entry in ipairs(page) do
        if entry.key == userId then
            return rank, score
        end
        rank = rank + 1
    end

    return nil, score
end

-----------------------------------------------------------
-- Event Handlers
-----------------------------------------------------------

-- Handle client requests for leaderboard data
GetLeaderboardData.OnServerInvoke = function(player)
    -- Rate limiting check
    if not CanSave(player) then
        -- Still allow viewing, just throttle
    end

    local data = GetTopPlayers()
    return data
end

-- Handle score update requests from client
local UpdateScoreEvent = Instance.new("RemoteFunction")
UpdateScoreEvent.Name = "UpdateLeaderboardScore"
UpdateScoreEvent.Parent = LeaderboardEvents

UpdateScoreEvent.OnServerInvoke = function(player, score)
    if type(score) ~= "number" then
        return false, "Score must be a number"
    end

    -- Only save if higher than current
    local currentRank, currentScore = GetPlayerRank(player)
    if currentScore and score <= currentScore then
        return false, "New score must be higher than current: " .. tostring(currentScore)
    end

    local success, message = SavePlayerScore(player, score)

    if success then
        -- Notify all clients of update
        local updatedData = GetTopPlayers()
        RefreshEvent:FireAllClients(updatedData)
    end

    return success, message
end

-- API for other scripts to update scores
local LeaderboardAPI = {}

function LeaderboardAPI.UpdateScore(player, score)
    return SavePlayerScore(player, score)
end

function LeaderboardAPI.GetTopPlayers()
    return GetTopPlayers()
end

function LeaderboardAPI.GetPlayerScore(player)
    local _, score = GetPlayerRank(player)
    return score
end

-- Expose API via a ModuleScript or _G
_G.LeaderboardAPI = LeaderboardAPI

-- Example: Listen for game-specific events
-- local GameEvents = ReplicatedStorage:WaitForChild("GameEvents")
-- GameEvents.LevelCompleted.Event:Connect(function(player, score)
--     LeaderboardAPI.UpdateScore(player, score)
-- end)

-----------------------------------------------------------
-- Player Management
-----------------------------------------------------------

Players.PlayerRemoving:Connect(function(player)
    -- Clean up cooldown data
    playerSaveCooldowns[player.UserId] = nil
end)

print("[Leaderboard] Server initialized. OrderedDataStore: GlobalLeaderboard_v1")
