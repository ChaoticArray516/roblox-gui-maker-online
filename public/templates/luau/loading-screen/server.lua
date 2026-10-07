--[[
    Loading Screen - Server Side
    Optional server-side for multiplayer synchronization and data pre-loading
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")

-- Remote Events
local LoadingEvents = Instance.new("Folder")
LoadingEvents.Name = "LoadingEvents"
LoadingEvents.Parent = ReplicatedStorage

local PlayerReadyEvent = Instance.new("RemoteEvent")
PlayerReadyEvent.Name = "PlayerReady"
PlayerReadyEvent.Parent = LoadingEvents

local ServerLoadStatus = Instance.new("RemoteEvent")
ServerLoadStatus.Name = "ServerLoadStatus"
ServerLoadStatus.Parent = LoadingEvents

-- Player ready tracking
local playersReady = {}
local totalPlayers = 0
local REQUIRED_READY_PERCENT = 0.8 -- 80% of players must be ready

-----------------------------------------------------------
-- Server Load Simulation
-----------------------------------------------------------

local serverLoadComplete = false

local function SimulateServerLoad()
    -- Simulate server initialization
    task.wait(2)

    -- Pre-generate any server-side data
    -- Load game configuration
    -- Initialize game systems

    serverLoadComplete = true
end

-----------------------------------------------------------
-- Player Ready Management
-----------------------------------------------------------

local function CheckAllPlayersReady()
    if totalPlayers == 0 then return true end

    local readyCount = 0
    for _, ready in pairs(playersReady) do
        if ready then
            readyCount = readyCount + 1
        end
    end

    return (readyCount / totalPlayers) >= REQUIRED_READY_PERCENT
end

PlayerReadyEvent.OnServerEvent:Connect(function(player)
    playersReady[player.UserId] = true
    print("[Loading] Player " .. player.Name .. " is ready.")

    if CheckAllPlayersReady() and serverLoadComplete then
        -- Notify all clients that game can start
        ServerLoadStatus:FireAllClients("ALL_READY")
    end
end)

-----------------------------------------------------------
-- Player Management
-----------------------------------------------------------

Players.PlayerAdded:Connect(function(player)
    totalPlayers = totalPlayers + 1
    playersReady[player.UserId] = false
end)

Players.PlayerRemoving:Connect(function(player)
    totalPlayers = totalPlayers - 1
    playersReady[player.UserId] = nil
end)

-- Start server load
SimulateServerLoad()

print("[LoadingScreen] Server loading manager initialized.")
