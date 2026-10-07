--[[
    Health Bar Server Extension
    Optional server-side for shield/armor mechanics
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Remote events
local HealthEvents = Instance.new("Folder")
HealthEvents.Name = "HealthBarEvents"
HealthEvents.Parent = ReplicatedStorage

local ShieldUpdate = Instance.new("RemoteEvent")
ShieldUpdate.Name = "ShieldUpdate"
ShieldUpdate.Parent = HealthEvents

local RequestShield = Instance.new("RemoteFunction")
RequestShield.Name = "RequestShield"
RequestShield.Parent = HealthEvents

-- Player shield data
local playerShields = {}

-----------------------------------------------------------
-- Shield System
-----------------------------------------------------------

function SetPlayerShield(player, amount, maxShield)
    playerShields[player.UserId] = {
        Current = amount or 0,
        Max = maxShield or 100,
    }
    ShieldUpdate:FireClient(player, amount, maxShield)
end

function DamagePlayerShield(player, damage)
    local shieldData = playerShields[player.UserId]
    if not shieldData or shieldData.Current <= 0 then
        return damage -- All damage passes through
    end

    local absorbed = math.min(damage, shieldData.Current)
    shieldData.Current = shieldData.Current - absorbed

    ShieldUpdate:FireClient(player, shieldData.Current, shieldData.Max)

    return damage - absorbed -- Remaining damage goes to health
end

-----------------------------------------------------------
-- Event Handlers
-----------------------------------------------------------

RequestShield.OnServerInvoke = function(player)
    local data = playerShields[player.UserId]
    if data then
        return data.Current, data.Max
    end
    return 0, 0
end

-- Example: Grant shield on spawn
Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function(character)
        local humanoid = character:WaitForChild("Humanoid")

        -- Give starting shield (optional)
        task.wait(1)
        SetPlayerShield(player, 50, 100)
    end)
end)

-- Cleanup
Players.PlayerRemoving:Connect(function(player)
    playerShields[player.UserId] = nil
end)

-- Expose API
_G.ShieldSystem = {
    SetShield = SetPlayerShield,
    DamageShield = DamagePlayerShield,
}

print("[HealthBar] Server extension initialized.")
