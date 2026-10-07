--[[
    RPG Inventory System - Server
    Features: DataStore persistence, RemoteEvent handling, inventory management
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")

-- DataStore
local InventoryDataStore = DataStoreService:GetDataStore("RPGInventory_v1")

-- Create Remote Events Folder
local Remotes = Instance.new("Folder")
Remotes.Name = "InventoryRemotes"
Remotes.Parent = ReplicatedStorage

-- RemoteEvents and RemoteFunctions
local RequestInventory = Instance.new("RemoteFunction")
RequestInventory.Name = "RequestInventory"
RequestInventory.Parent = Remotes

local EquipItem = Instance.new("RemoteEvent")
EquipItem.Name = "EquipItem"
EquipItem.Parent = Remotes

local UnequipItem = Instance.new("RemoteEvent")
UnequipItem.Name = "UnequipItem"
UnequipItem.Parent = Remotes

local UseItem = Instance.new("RemoteEvent")
UseItem.Name = "UseItem"
UseItem.Parent = Remotes

local DropItem = Instance.new("RemoteEvent")
DropItem.Name = "DropItem"
DropItem.Parent = Remotes

local DestroyItem = Instance.new("RemoteEvent")
DestroyItem.Name = "DestroyItem"
DestroyItem.Parent = Remotes

-- ============================================
-- SERVER CONFIGURATION
-- ============================================
local SERVER_CONFIG = {
    SaveInterval = 60,           -- Auto-save every 60 seconds
    MaxInventorySlots = 40,      -- Maximum inventory slots
    MaxStackSize = 99,           -- Maximum item stack size
    DropItemDespawnTime = 300,   -- 5 minutes before dropped items despawn
}

-- ============================================
-- PLAYER DATA MANAGEMENT
-- ============================================
local PlayerData = {}

-- Default inventory template
local function GetDefaultInventory()
    return {
        Inventory = {},
        Equipped = {
            Helmet = nil,
            Armor = nil,
            Weapon = nil,
            Boots = nil,
        },
        Coins = 0,
        LastSave = 0,
    }
end

-- Load player data from DataStore
local function LoadPlayerData(player)
    local success, data = pcall(function()
        return InventoryDataStore:GetAsync(tostring(player.UserId))
    end)

    if success and data then
        PlayerData[player] = data
    else
        PlayerData[player] = GetDefaultInventory()
    end

    -- Give starter items
    if #PlayerData[player].Inventory == 0 then
        GiveStarterItems(player)
    end
end

-- Save player data to DataStore
local function SavePlayerData(player)
    local data = PlayerData[player]
    if not data then return end

    data.LastSave = os.time()

    local success, err = pcall(function()
        InventoryDataStore:SetAsync(tostring(player.UserId), data)
    end)

    if not success then
        warn("Failed to save inventory data for " .. player.Name .. ": " .. tostring(err))
    end
end

-- Give starter items to new players
function GiveStarterItems(player)
    local data = PlayerData[player]
    if not data then return end

    data.Inventory[1] = {
        Name = "Wooden Sword",
        Rarity = "Common",
        Icon = "rbxassetid://12345",
        Description = "Your first weapon.",
        SlotType = "Weapon",
        Usable = false,
        Stats = {ATK = 5},
    }
    data.Inventory[2] = {
        Name = "Healing Potion",
        Rarity = "Common",
        Icon = "rbxassetid://12346",
        Description = "Restores 30 HP.",
        Usable = true,
        Quantity = 3,
        Stats = {HP = 30},
    }
    data.Coins = 100
end

-- ============================================
-- INVENTORY OPERATIONS
-- ============================================
local InventoryOps = {}

function InventoryOps.AddItem(player, itemData, quantity)
    local data = PlayerData[player]
    if not data then return false end

    quantity = quantity or 1

    -- Try to stack with existing items
    if itemData.Stackable then
        for i = 1, SERVER_CONFIG.MaxInventorySlots do
            local existing = data.Inventory[i]
            if existing and existing.Name == itemData.Name then
                existing.Quantity = math.min(existing.Quantity + quantity, SERVER_CONFIG.MaxStackSize)
                return true
            end
        end
    end

    -- Find empty slot
    for i = 1, SERVER_CONFIG.MaxInventorySlots do
        if not data.Inventory[i] then
            data.Inventory[i] = table.clone(itemData)
            data.Inventory[i].Quantity = quantity
            return true
        end
    end

    return false -- Inventory full
end

function InventoryOps.RemoveItem(player, slotIndex, quantity)
    local data = PlayerData[player]
    if not data then return false end

    local item = data.Inventory[slotIndex]
    if not item then return false end

    quantity = quantity or item.Quantity or 1

    if (item.Quantity or 1) <= quantity then
        data.Inventory[slotIndex] = nil
    else
        item.Quantity = item.Quantity - quantity
    end

    return true
end

function InventoryOps.EquipItem(player, slotIndex, equipSlot)
    local data = PlayerData[player]
    if not data then return false end

    local item = data.Inventory[slotIndex]
    if not item then return false end
    if item.SlotType and item.SlotType ~= equipSlot then return false end

    -- Unequip current item in that slot
    if data.Equipped[equipSlot] then
        -- Return to inventory
        InventoryOps.AddItem(player, data.Equipped[equipSlot], 1)
    end

    -- Equip new item
    data.Equipped[equipSlot] = table.clone(item)
    data.Inventory[slotIndex] = nil

    return true
end

function InventoryOps.UnequipItem(player, equipSlot)
    local data = PlayerData[player]
    if not data then return false end

    local item = data.Equipped[equipSlot]
    if not item then return false end

    -- Return to inventory
    InventoryOps.AddItem(player, item, 1)
    data.Equipped[equipSlot] = nil

    return true
end

-- ============================================
-- REMOTE EVENT HANDLERS
-- ============================================

-- RequestInventory - Client requests full inventory data
RequestInventory.OnServerInvoke = function(player)
    local data = PlayerData[player]
    if not data then return nil end

    return {
        Inventory = data.Inventory,
        Equipped = data.Equipped,
        Coins = data.Coins,
    }
end

-- EquipItem - Client requests to equip an item
EquipItem.OnServerEvent:Connect(function(player, slotIndex, equipSlot)
    if type(slotIndex) ~= "number" or type(equipSlot) ~= "string" then return end

    local success = InventoryOps.EquipItem(player, slotIndex, equipSlot)
    if success then
        -- Notify client to refresh
        print(player.Name .. " equipped item in " .. equipSlot)
    end
end)

-- UnequipItem - Client requests to unequip an item
UnequipItem.OnServerEvent:Connect(function(player, equipSlot)
    if type(equipSlot) ~= "string" then return end

    local success = InventoryOps.UnequipItem(player, equipSlot)
    if success then
        print(player.Name .. " unequipped item from " .. equipSlot)
    end
end)

-- UseItem - Client uses a consumable item
UseItem.OnServerEvent:Connect(function(player, slotIndex)
    if type(slotIndex) ~= "number" then return end

    local data = PlayerData[player]
    if not data then return end

    local item = data.Inventory[slotIndex]
    if not item or not item.Usable then return end

    -- Apply item effects (e.g., healing)
    if item.Stats and item.Stats.HP then
        -- Heal player
        local humanoid = player.Character and player.Character:FindFirstChild("Humanoid")
        if humanoid then
            humanoid.Health = math.min(humanoid.Health + item.Stats.HP, humanoid.MaxHealth)
        end
    end

    -- Remove or reduce item
    InventoryOps.RemoveItem(player, slotIndex, 1)
end)

-- DropItem - Client drops an item on the ground
DropItem.OnServerEvent:Connect(function(player, slotIndex)
    if type(slotIndex) ~= "number" then return end

    local data = PlayerData[player]
    if not data then return end

    local item = data.Inventory[slotIndex]
    if not item then return end

    -- Create physical dropped item in workspace
    local character = player.Character
    if not character then return end

    local rootPart = character:FindFirstChild("HumanoidRootPart")
    if not rootPart then return end

    local dropPosition = rootPart.Position + rootPart.CFrame.LookVector * 3

    local dropPart = Instance.new("Part")
    dropPart.Name = "DroppedItem_" .. item.Name
    dropPart.Size = Vector3.new(2, 2, 2)
    dropPart.Position = dropPosition
    dropPart.Anchored = false
    dropPart.CanCollide = true
    dropPart.Material = Enum.Material.Neon
    dropPart.Color = Color3.fromRGB(255, 200, 50)
    dropPart.Parent = workspace

    -- Add pickup prompt
    local prompt = Instance.new("ProximityPrompt")
    prompt.ActionText = "Pick up " .. item.Name
    prompt.ObjectText = item.Rarity or "Common"
    prompt.HoldDuration = 0.5
    prompt.MaxActivationDistance = 10
    prompt.RequiresLineOfSight = false
    prompt.Parent = dropPart

    prompt.Triggered:Connect(function(otherPlayer)
        local otherData = PlayerData[otherPlayer]
        if not otherData then return end

        local added = InventoryOps.AddItem(otherPlayer, item, item.Quantity or 1)
        if added then
            dropPart:Destroy()
        else
            -- Notify inventory full
            -- Could send a RemoteEvent here
        end
    end)

    -- Despawn timer
    task.delay(SERVER_CONFIG.DropItemDespawnTime, function()
        if dropPart and dropPart.Parent then
            dropPart:Destroy()
        end
    end)

    -- Remove from inventory
    InventoryOps.RemoveItem(player, slotIndex, item.Quantity or 1)
end)

-- DestroyItem - Client destroys an item
DestroyItem.OnServerEvent:Connect(function(player, slotIndex)
    if type(slotIndex) ~= "number" then return end

    InventoryOps.RemoveItem(player, slotIndex)
end)

-- ============================================
-- PLAYER LIFECYCLE
-- ============================================

-- Player joins
Players.PlayerAdded:Connect(function(player)
    LoadPlayerData(player)
end)

-- Player leaves - save data
Players.PlayerRemoving:Connect(function(player)
    SavePlayerData(player)
    PlayerData[player] = nil
end)

-- Auto-save loop
while true do
    task.wait(SERVER_CONFIG.SaveInterval)
    for _, player in ipairs(Players:GetPlayers()) do
        SavePlayerData(player)
    end
end
