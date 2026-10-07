--[[
    Shop UI System - Server
    Features: MarketplaceService integration, gamepass validation, developer product processing,
              purchase logging, DataStore persistence
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")
local MemoryStoreService = game:GetService("MemoryStoreService")

-- DataStores
local PurchaseLogStore = DataStoreService:GetDataStore("PurchaseLog_v1")
local PlayerPurchaseStore = DataStoreService:GetDataStore("PlayerPurchases_v1")

-- Remote Events/Functions
local ShopRemotes = Instance.new("Folder")
ShopRemotes.Name = "ShopRemotes"
ShopRemotes.Parent = ReplicatedStorage

local RequestShopData = Instance.new("RemoteFunction")
RequestShopData.Name = "RequestShopData"
RequestShopData.Parent = ShopRemotes

local NotifyPurchase = Instance.new("RemoteEvent")
NotifyPurchase.Name = "NotifyPurchase"
NotifyPurchase.Parent = ShopRemotes

-- ============================================
-- SHOP DATABASE
-- ============================================
local SHOP_ITEMS = {
    -- Gamepasses
    {
        Id = "vip_pass",
        Name = "VIP Pass",
        Description = "Exclusive VIP perks including 2x rewards, special chat color, VIP lounge access, and exclusive pet!",
        Category = "Gamepasses",
        Type = "Gamepass",
        Price = 399,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        GamepassId = 12345678,
    },
    {
        Id = "2x_coins",
        Name = "2x Coins",
        Description = "Permanently doubles all coin earnings. Stackable with boosts!",
        Category = "Gamepasses",
        Type = "Gamepass",
        Price = 249,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        GamepassId = 12345679,
    },
    {
        Id = "2x_xp",
        Name = "2x XP Boost",
        Description = "Gain experience points twice as fast. Level up in record time!",
        Category = "Gamepasses",
        Type = "Gamepass",
        Price = 299,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        GamepassId = 12345680,
    },
    -- Currency Products
    {
        Id = "coins_1k",
        Name = "1,000 Coins",
        Description = "A quick coin boost to get you started!",
        Category = "Currency",
        Type = "DeveloperProduct",
        Price = 49,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        ProductId = 87654322,
        Reward = {Coins = 1000},
    },
    {
        Id = "coins_5k",
        Name = "5,000 Coins",
        Description = "Great value for your Robux!",
        Category = "Currency",
        Type = "DeveloperProduct",
        Price = 199,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        ProductId = 87654323,
        Reward = {Coins = 5000},
    },
    {
        Id = "coins_25k",
        Name = "25,000 Coins",
        Description = "The best coin deal available!",
        Category = "Currency",
        Type = "DeveloperProduct",
        Price = 799,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        ProductId = 87654324,
        Reward = {Coins = 25000},
    },
    -- Boosts
    {
        Id = "speed_boost_1h",
        Name = "Speed Boost (1h)",
        Description = "Move at double speed for 1 hour!",
        Category = "Boosts",
        Type = "DeveloperProduct",
        Price = 29,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        ProductId = 87654325,
        Reward = {BoostType = "Speed", Duration = 3600, Multiplier = 2},
    },
    {
        Id = "luck_boost_2h",
        Name = "Luck Boost (2h)",
        Description = "Get 3x better drop rates for 2 hours!",
        Category = "Boosts",
        Type = "DeveloperProduct",
        Price = 39,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        ProductId = 87654326,
        Reward = {BoostType = "Luck", Duration = 7200, Multiplier = 3},
    },
    -- Cosmetics
    {
        Id = "rainbow_trail",
        Name = "Rainbow Trail",
        Description = "Leave a beautiful rainbow trail as you move!",
        Category = "Cosmetics",
        Type = "DeveloperProduct",
        Price = 149,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        ProductId = 87654327,
        Reward = {Cosmetic = "RainbowTrail"},
    },
    {
        Id = "golden_skin",
        Name = "Golden Skin",
        Description = "Shine bright with this golden character skin!",
        Category = "Cosmetics",
        Type = "DeveloperProduct",
        Price = 99,
        CurrencyType = "Robux",
        Icon = "rbxassetid://0",
        ProductId = 87654328,
        Reward = {Cosmetic = "GoldenSkin"},
    },
}

-- ============================================
-- PLAYER PURCHASE DATA
-- ============================================
local PlayerPurchases = {}

local function LoadPlayerPurchases(player)
    local success, data = pcall(function()
        return PlayerPurchaseStore:GetAsync(tostring(player.UserId))
    end)

    if success and data then
        PlayerPurchases[player] = data
    else
        PlayerPurchases[player] = {
            Purchases = {},
            ActiveBoosts = {},
            OwnedCosmetics = {},
            TotalSpent = 0,
        }
    end
end

local function SavePlayerPurchases(player)
    local data = PlayerPurchases[player]
    if not data then return end

    local success, err = pcall(function()
        PlayerPurchaseStore:SetAsync(tostring(player.UserId), data)
    end)
    if not success then
        warn("Failed to save purchases for " .. player.Name .. ": " .. tostring(err))
    end
end

-- ============================================
-- REMOTE HANDLERS
-- ============================================

-- RequestShopData - Returns shop items + ownership info
RequestShopData.OnServerInvoke = function(player)
    local data = PlayerPurchases[player]
    if not data then return nil end

    -- Check gamepass ownership
    local itemsCopy = {}
    for _, item in ipairs(SHOP_ITEMS) do
        local itemCopy = table.clone(item)
        if item.Type == "Gamepass" and item.GamepassId then
            local success, owns = pcall(function()
                return MarketplaceService:UserOwnsGamePassAsync(player.UserId, item.GamepassId)
            end)
            itemCopy.Owned = success and owns
        end
        table.insert(itemsCopy, itemCopy)
    end

    return {
        Items = itemsCopy,
        ActiveBoosts = data.ActiveBoosts,
        OwnedCosmetics = data.OwnedCosmetics,
    }
end

-- ============================================
-- MARKETPLACESERVICE INTEGRATION
-- ============================================

-- ProcessReceipt - Handles developer product purchases
MarketplaceService.ProcessReceipt = function(receiptInfo)
    local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
    if not player then
        return Enum.ProductPurchaseDecision.NotProcessedYet
    end

    -- Find the product in our database
    local productData = nil
    for _, item in ipairs(SHOP_ITEMS) do
        if item.ProductId == receiptInfo.ProductId then
            productData = item
            break
        end
    end

    if not productData then
        warn("Unknown product: " .. receiptInfo.ProductId)
        return Enum.ProductPurchaseDecision.NotProcessedYet
    end

    -- Load player data
    LoadPlayerPurchases(player)
    local data = PlayerPurchases[player]

    -- Apply rewards
    if productData.Reward then
        if productData.Reward.Coins then
            -- Add coins to player's data (use your coin system)
            Logic.GrantCoins(player, productData.Reward.Coins)
        end

        if productData.Reward.BoostType then
            -- Activate boost
            data.ActiveBoosts[productData.Reward.BoostType] = {
                StartTime = os.time(),
                Duration = productData.Reward.Duration,
                Multiplier = productData.Reward.Multiplier,
            }
        end

        if productData.Reward.Cosmetic then
            data.OwnedCosmetics[productData.Reward.Cosmetic] = true
        end
    end

    -- Log purchase
    table.insert(data.Purchases, {
        ProductId = receiptInfo.ProductId,
        ItemName = productData.Name,
        Price = productData.Price,
        Timestamp = os.time(),
    })
    data.TotalSpent = data.TotalSpent + productData.Price

    -- Save
    SavePlayerPurchases(player)

    -- Notify client
    NotifyPurchase:FireClient(player, {
        Success = true,
        ItemName = productData.Name,
        Reward = productData.Reward,
    })

    -- Log to analytics
    Logic.LogPurchase(player, receiptInfo, productData)

    return Enum.ProductPurchaseDecision.PurchaseGranted
end

-- ============================================
-- PURCHASE PROCESSING
-- ============================================
local Logic = {}

function Logic.GrantCoins(player, amount)
    -- Integrate with your coin system
    -- This is a placeholder - replace with your actual coin granting logic
    local leaderstats = player:FindFirstChild("leaderstats")
    if leaderstats then
        local coins = leaderstats:FindFirstChild("Coins")
        if coins then
            coins.Value = coins.Value + amount
        end
    end
end

function Logic.ActivateBoost(player, boostType, duration, multiplier)
    -- Activate the boost on the player
    print(string.format("Activated %s boost (%.0fx) for %s for %d seconds",
        boostType, multiplier, player.Name, duration))

    -- Apply to character
    local character = player.Character
    if not character then return end

    if boostType == "Speed" then
        local humanoid = character:FindFirstChildOfClass("Humanoid")
        if humanoid then
            humanoid.WalkSpeed = humanoid.WalkSpeed * multiplier

            -- Revert after duration
            task.delay(duration, function()
                if humanoid and humanoid.Parent then
                    humanoid.WalkSpeed = humanoid.WalkSpeed / multiplier
                end
                -- Remove from active boosts
                local data = PlayerPurchases[player]
                if data then
                    data.ActiveBoosts[boostType] = nil
                    SavePlayerPurchases(player)
                end
            end)
        end
    elseif boostType == "Luck" then
        -- Set a luck multiplier attribute on the player
        player:SetAttribute("LuckMultiplier", multiplier)

        task.delay(duration, function()
            player:SetAttribute("LuckMultiplier", 1)
            local data = PlayerPurchases[player]
            if data then
                data.ActiveBoosts[boostType] = nil
                SavePlayerPurchases(player)
            end
        end)
    end

    -- Notify client
    NotifyPurchase:FireClient(player, {
        Success = true,
        Message = boostType .. " boost activated for " .. (duration / 60) .. " minutes!",
    })
end

function Logic.ApplyCosmetic(player, cosmeticId)
    print("Applied cosmetic: " .. cosmeticId .. " to " .. player.Name)
    -- Apply cosmetic effect to character
    -- e.g., particles, color changes, trails

    local character = player.Character
    if not character then return end

    if cosmeticId == "RainbowTrail" then
        local humanoidRootPart = character:WaitForChild("HumanoidRootPart")
        local trail = Instance.new("Trail")
        trail.Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 0, 0)),
            ColorSequenceKeypoint.new(0.2, Color3.fromRGB(255, 255, 0)),
            ColorSequenceKeypoint.new(0.4, Color3.fromRGB(0, 255, 0)),
            ColorSequenceKeypoint.new(0.6, Color3.fromRGB(0, 255, 255)),
            ColorSequenceKeypoint.new(0.8, Color3.fromRGB(0, 0, 255)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 0, 255)),
        })
        trail.Lifetime = 0.5
        trail.WidthScale = NumberSequence.new(0.5, 0)
        trail.Parent = humanoidRootPart
    elseif cosmeticId == "GoldenSkin" then
        for _, part in ipairs(character:GetDescendants()) do
            if part:IsA("BasePart") and part.Name ~= "HumanoidRootPart" then
                part.Color = Color3.fromRGB(255, 215, 0)
                part.Material = Enum.Material.Metal
            end
        end
    end
end

function Logic.LogPurchase(player, receiptInfo, productData)
    local logEntry = {
        UserId = player.UserId,
        Username = player.Name,
        ProductId = receiptInfo.ProductId,
        ItemName = productData.Name,
        Price = productData.Price,
        CurrencySpent = receiptInfo.CurrencySpent,
        Timestamp = os.time(),
    }

    -- Save to DataStore (keep last 1000 entries)
    local success = pcall(function()
        local key = "log_" .. tostring(os.time()) .. "_" .. tostring(player.UserId)
        PurchaseLogStore:SetAsync(key, logEntry)
    end)

    if not success then
        warn("Failed to log purchase")
    end
end

-- ============================================
-- PLAYER LIFECYCLE
-- ============================================
Players.PlayerAdded:Connect(function(player)
    LoadPlayerPurchases(player)

    -- Re-apply owned cosmetics
    local data = PlayerPurchases[player]
    if data then
        task.wait(3) -- Wait for character
        for cosmeticId, _ in pairs(data.OwnedCosmetics) do
            Logic.ApplyCosmetic(player, cosmeticId)
        end
    end
end)

Players.PlayerRemoving:Connect(function(player)
    SavePlayerPurchases(player)
    PlayerPurchases[player] = nil
end)

-- Auto-save loop
while true do
    task.wait(60)
    for _, player in ipairs(Players:GetPlayers()) do
        SavePlayerPurchases(player)
    end
end
