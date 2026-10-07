--[[
    Pet Shop System - Server
    Features: Pet purchase validation, coin management, equip/unequip, DataStore persistence
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")

-- DataStores
local PetDataStore = DataStoreService:GetDataStore("PetShopData_v1")
local CoinDataStore = DataStoreService:GetDataStore("PetCoins_v1")

-- Remote Events/Functions
local PetShopRemotes = Instance.new("Folder")
PetShopRemotes.Name = "PetShopRemotes"
PetShopRemotes.Parent = ReplicatedStorage

local RequestPets = Instance.new("RemoteFunction")
RequestPets.Name = "RequestPets"
RequestPets.Parent = PetShopRemotes

local BuyPet = Instance.new("RemoteFunction")
BuyPet.Name = "BuyPet"
BuyPet.Parent = PetShopRemotes

local EquipPet = Instance.new("RemoteFunction")
EquipPet.Name = "EquipPet"
EquipPet.Parent = PetShopRemotes

local UnequipPet = Instance.new("RemoteFunction")
UnequipPet.Name = "UnequipPet"
UnequipPet.Parent = PetShopRemotes

local GetCoinBalance = Instance.new("RemoteFunction")
GetCoinBalance.Name = "GetCoinBalance"
GetCoinBalance.Parent = PetShopRemotes

-- ============================================
-- PET DATABASE
-- ============================================
local PET_DATABASE = {
    pet_dragon = {
        Id = "pet_dragon",
        Name = "Fire Dragon",
        Rarity = "Legendary",
        Price = 5000,
        Stats = {Speed = 85, Power = 95, Luck = 70},
        ProductId = nil, -- Set to DevProduct ID for Robux purchase
    },
    pet_phoenix = {
        Id = "pet_phoenix",
        Name = "Phoenix",
        Rarity = "Legendary",
        Price = 4500,
        Stats = {Speed = 90, Power = 80, Luck = 85},
        ProductId = nil,
    },
    pet_wolf = {
        Id = "pet_wolf",
        Name = "Shadow Wolf",
        Rarity = "Rare",
        Price = 2500,
        Stats = {Speed = 92, Power = 65, Luck = 60},
        ProductId = nil,
    },
    pet_cat = {
        Id = "pet_cat",
        Name = "Lucky Cat",
        Rarity = "Uncommon",
        Price = 1000,
        Stats = {Speed = 60, Power = 40, Luck = 95},
        ProductId = nil,
    },
    pet_dog = {
        Id = "pet_dog",
        Name = "Golden Retriever",
        Rarity = "Common",
        Price = 500,
        Stats = {Speed = 70, Power = 50, Luck = 65},
        ProductId = nil,
    },
    pet_unicorn = {
        Id = "pet_unicorn",
        Name = "Rainbow Unicorn",
        Rarity = "Epic",
        Price = 3500,
        Stats = {Speed = 80, Power = 70, Luck = 90},
        ProductId = nil,
    },
}

-- ============================================
-- PLAYER DATA
-- ============================================
local PlayerData = {}

local function GetDefaultData()
    return {
        OwnedPets = {},
        EquippedPet = nil,
        Coins = 1000, -- Starting coins
        TotalPurchases = 0,
    }
end

local function LoadPlayerData(player)
    local success, data = pcall(function()
        return PetDataStore:GetAsync("pets_" .. player.UserId)
    end)

    if success and data then
        PlayerData[player] = data
    else
        PlayerData[player] = GetDefaultData()
    end

    -- Also load coins
    local coinSuccess, coinData = pcall(function()
        return CoinDataStore:GetAsync("coins_" .. player.UserId)
    end)
    if coinSuccess and coinData then
        PlayerData[player].Coins = coinData
    end
end

local function SavePlayerData(player)
    local data = PlayerData[player]
    if not data then return end

    local success, err = pcall(function()
        PetDataStore:SetAsync("pets_" .. player.UserId, {
            OwnedPets = data.OwnedPets,
            EquippedPet = data.EquippedPet,
            TotalPurchases = data.TotalPurchases,
        })
    end)
    if not success then
        warn("Failed to save pet data: " .. tostring(err))
    end

    local coinSuccess, coinErr = pcall(function()
        CoinDataStore:SetAsync("coins_" .. player.UserId, data.Coins)
    end)
    if not coinSuccess then
        warn("Failed to save coin data: " .. tostring(coinErr))
    end
end

-- ============================================
-- REMOTE HANDLERS
-- ============================================

-- RequestPets - Returns pet database + player ownership info
RequestPets.OnServerInvoke = function(player)
    local data = PlayerData[player]
    if not data then return nil end

    local petsList = {}
    for id, pet in pairs(PET_DATABASE) do
        local petCopy = table.clone(pet)
        petCopy.Owned = data.OwnedPets[id] == true
        table.insert(petsList, petCopy)
    end

    return {
        Pets = petsList,
        OwnedPets = data.OwnedPets,
        EquippedPet = data.EquippedPet,
        Coins = data.Coins,
    }
end

-- BuyPet - Process pet purchase with coins
BuyPet.OnServerInvoke = function(player, petId)
    if type(petId) ~= "string" then
        return {Success = false, Message = "Invalid pet ID"}
    end

    local data = PlayerData[player]
    if not data then
        return {Success = false, Message = "Data not loaded"}
    end

    -- Check if already owned
    if data.OwnedPets[petId] then
        return {Success = false, Message = "Already owned"}
    end

    -- Validate pet exists
    local pet = PET_DATABASE[petId]
    if not pet then
        return {Success = false, Message = "Pet not found"}
    end

    -- Check coins
    if data.Coins < pet.Price then
        return {Success = false, Message = "Not enough coins! Need " .. pet.Price .. " coins."}
    end

    -- Deduct coins and grant pet
    data.Coins = data.Coins - pet.Price
    data.OwnedPets[petId] = true
    data.TotalPurchases = data.TotalPurchases + 1

    -- Save
    SavePlayerData(player)

    -- Award pet to player character (optional)
    Logic.SpawnPetModel(player, petId)

    return {
        Success = true,
        Message = "Purchased " .. pet.Name .. "!",
        NewBalance = data.Coins,
    }
end

-- EquipPet - Equip a pet
EquipPet.OnServerInvoke = function(player, petId)
    if type(petId) ~= "string" then
        return {Success = false, Message = "Invalid pet ID"}
    end

    local data = PlayerData[player]
    if not data then
        return {Success = false, Message = "Data not loaded"}
    end

    if not data.OwnedPets[petId] then
        return {Success = false, Message = "Pet not owned"}
    end

    data.EquippedPet = petId
    SavePlayerData(player)

    -- Spawn pet model following player
    Logic.SpawnPetModel(player, petId)

    return {Success = true}
end

-- UnequipPet - Unequip current pet
UnequipPet.OnServerInvoke = function(player)
    local data = PlayerData[player]
    if not data then
        return {Success = false, Message = "Data not loaded"}
    end

    data.EquippedPet = nil
    SavePlayerData(player)

    -- Remove pet model
    Logic.RemovePetModel(player)

    return {Success = true}
end

-- GetCoinBalance - Returns current coin balance
GetCoinBalance.OnServerInvoke = function(player)
    local data = PlayerData[player]
    return data and data.Coins or 0
end

-- ============================================
-- PET MODEL MANAGEMENT
-- ============================================
local ActivePetModels = {}

function Logic.SpawnPetModel(player, petId)
    -- Remove existing model
    Logic.RemovePetModel(player)

    local character = player.Character
    if not character then return end

    local pet = PET_DATABASE[petId]
    if not pet then return end

    -- Create a simple pet model (replace with your actual pet models)
    local petModel = Instance.new("Part")
    petModel.Name = "EquippedPet_" .. petId
    petModel.Size = Vector3.new(2, 2, 2)
    petModel.Shape = Enum.PartType.Ball
    petModel.Color = Color3.fromRGB(255, 100, 50)
    petModel.Material = Enum.Material.Neon
    petModel.CanCollide = false
    petModel.Parent = workspace

    -- Weld to character
    local humanoidRootPart = character:WaitForChild("HumanoidRootPart")
    local weld = Instance.new("Weld")
    weld.Part0 = humanoidRootPart
    weld.Part1 = petModel
    weld.C0 = CFrame.new(3, 2, 0)
    weld.Parent = petModel

    -- Add floating animation
    local floatOffset = Instance.new("NumberValue")
    floatOffset.Name = "FloatOffset"
    floatOffset.Value = 0
    floatOffset.Parent = petModel

    task.spawn(function()
        while petModel and petModel.Parent do
            local t = tick()
            weld.C0 = CFrame.new(3, 2 + math.sin(t * 2) * 0.5, 0) * CFrame.Angles(0, t, 0)
            task.wait(0.05)
        end
    end)

    ActivePetModels[player] = petModel
end

function Logic.RemovePetModel(player)
    if ActivePetModels[player] then
        ActivePetModels[player]:Destroy()
        ActivePetModels[player] = nil
    end
end

-- ============================================
-- COIN MANAGEMENT
-- ============================================
function Logic.AddCoins(player, amount)
    local data = PlayerData[player]
    if not data then return end

    data.Coins = math.max(0, data.Coins + amount)
    SavePlayerData(player)
end

function Logic.RemoveCoins(player, amount)
    Logic.AddCoins(player, -amount)
end

-- Developer Products for coin purchases
MarketplaceService.ProcessReceipt = function(receiptInfo)
    local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
    if not player then return Enum.ProductPurchaseDecision.NotProcessedYet end

    -- Map product IDs to coin amounts
    local coinProducts = {
        [123456789] = 1000,  -- 1K Coins
        [123456790] = 5000,  -- 5K Coins
        [123456791] = 25000, -- 25K Coins
    }

    local coins = coinProducts[receiptInfo.ProductId]
    if coins then
        Logic.AddCoins(player, coins)
    end

    return Enum.ProductPurchaseDecision.PurchaseGranted
end

-- ============================================
-- PLAYER LIFECYCLE
-- ============================================
Players.PlayerAdded:Connect(function(player)
    LoadPlayerData(player)

    -- Spawn equipped pet
    local data = PlayerData[player]
    if data and data.EquippedPet then
        task.wait(3) -- Wait for character to load
        Logic.SpawnPetModel(player, data.EquippedPet)
    end
end)

Players.PlayerRemoving:Connect(function(player)
    Logic.RemovePetModel(player)
    SavePlayerData(player)
    PlayerData[player] = nil
end)

-- Auto-save
while true do
    task.wait(60)
    for _, player in ipairs(Players:GetPlayers()) do
        SavePlayerData(player)
    end
end
