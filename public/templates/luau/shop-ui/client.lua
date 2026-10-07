--[[
    Shop UI System - Client
    Features: Category tabs, item grid, MarketplaceService integration, purchase prompts
    Place in: StarterPlayer > StarterPlayerScripts
--]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Remotes
local ShopRemotes = ReplicatedStorage:WaitForChild("ShopRemotes")
local RequestShopData = ShopRemotes:WaitForChild("RequestShopData")
local NotifyPurchase = ShopRemotes:WaitForChild("NotifyPurchase")

-- ============================================
-- CONFIGURATION
-- ============================================
local CONFIG = {
    AnimSpeed = 0.25,
    CardHoverScale = 1.03,
    ItemsPerRow = 3,
    Categories = {
        {Id = "Featured", Label = "Featured", Icon = "rbxassetid://0", Color = Color3.fromRGB(255, 180, 50)},
        {Id = "Gamepasses", Label = "Gamepasses", Icon = "rbxassetid://0", Color = Color3.fromRGB(100, 150, 255)},
        {Id = "Currency", Label = "Currency", Icon = "rbxassetid://0", Color = Color3.fromRGB(50, 200, 100)},
        {Id = "Boosts", Label = "Boosts", Icon = "rbxassetid://0", Color = Color3.fromRGB(255, 80, 80)},
        {Id = "Cosmetics", Label = "Cosmetics", Icon = "rbxassetid://0", Color = Color3.fromRGB(200, 100, 255)},
    },
    CurrencyTypeColors = {
        Robux = Color3.fromRGB(100, 220, 100),
        Coins = Color3.fromRGB(255, 200, 50),
        Gems = Color3.fromRGB(100, 200, 255),
    },
}

-- ============================================
-- STATE
-- ============================================
local State = {
    IsVisible = false,
    CurrentCategory = "Featured",
    ShopItems = {},
    OwnedGamepasses = {},
    SelectedItem = nil,
    CoinBalance = 0,
    GemBalance = 0,
}

-- ============================================
-- UTILITY
-- ============================================
local function Create(className, properties)
    local instance = Instance.new(className)
    for key, value in pairs(properties or {}) do
        instance[key] = value
    end
    return instance
end

local function Tween(instance, properties, duration, easingStyle, easingDirection)
    local tween = TweenService:Create(
        instance,
        TweenInfo.new(
            duration or CONFIG.AnimSpeed,
            easingStyle or Enum.EasingStyle.Quad,
            easingDirection or Enum.EasingDirection.Out
        ),
        properties
    )
    tween:Play()
    return tween
end

local function TweenBounce(instance, properties, duration)
    return Tween(instance, properties, duration, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
end

local function FormatNumber(num)
    if num >= 1000000 then return string.format("%.1fM", num / 1000000)
    elseif num >= 1000 then return string.format("%.1fK", num / 1000)
    else return tostring(num) end
end

-- ============================================
-- UI CONSTRUCTION
-- ============================================
local UI = {}

function UI.Build()
    -- ScreenGui
    local screenGui = Create("ScreenGui", {
        Name = "ShopUiGui",
        Parent = playerGui,
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        Enabled = false,
    })
    UI.ScreenGui = screenGui

    -- Background Dim
    local bgDim = Create("Frame", {
        Name = "BackgroundDim",
        Parent = screenGui,
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundColor3 = Color3.fromRGB(0, 0, 0),
        BackgroundTransparency = 0.45,
        BorderSizePixel = 0,
        ZIndex = 1,
    })

    -- Main Frame
    local mainFrame = Create("Frame", {
        Name = "MainFrame",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        Size = UDim2.new(0, 600, 0, 440),
        BackgroundColor3 = Color3.fromRGB(245, 245, 255),
        BorderSizePixel = 0,
        ClipsDescendants = true,
        ZIndex = 10,
    })
    UI.MainFrame = mainFrame

    Create("UICorner", {CornerRadius = UDim.new(0, 14), Parent = mainFrame})
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(250, 250, 255)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(235, 238, 250)),
        }),
        Rotation = 135,
        Parent = mainFrame,
    })

    -- Header Bar
    local headerBar = Create("Frame", {
        Name = "HeaderBar",
        Parent = mainFrame,
        Size = UDim2.new(1, 0, 0, 54),
        BackgroundColor3 = Color3.fromRGB(60, 65, 100),
        BorderSizePixel = 0,
        ZIndex = 11,
    })

    -- Shop Title
    Create("TextLabel", {
        Name = "ShopTitle",
        Parent = headerBar,
        Position = UDim2.new(0, 18, 0, 0),
        Size = UDim2.new(0, 180, 1, 0),
        BackgroundTransparency = 1,
        Text = "STORE",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 24,
        Font = Enum.Font.GothamBlack,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
    })

    -- Currency Frame
    local currencyFrame = Create("Frame", {
        Name = "CurrencyFrame",
        Parent = headerBar,
        Position = UDim2.new(1, -250, 0.5, -15),
        Size = UDim2.new(0, 200, 0, 32),
        BackgroundColor3 = Color3.fromRGB(45, 50, 80),
        BorderSizePixel = 0,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = currencyFrame})

    -- Gems Amount
    UI.GemsAmount = Create("TextLabel", {
        Name = "GemsAmount",
        Parent = currencyFrame,
        Position = UDim2.new(0, 30, 0, 0),
        Size = UDim2.new(0, 80, 1, 0),
        BackgroundTransparency = 1,
        Text = "1,250",
        TextColor3 = Color3.fromRGB(80, 200, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 13,
    })

    -- Coins Amount
    UI.CoinsAmount = Create("TextLabel", {
        Name = "CoinsAmount",
        Parent = currencyFrame,
        Position = UDim2.new(0, 120, 0, 0),
        Size = UDim2.new(0, 80, 1, 0),
        BackgroundTransparency = 1,
        Text = "5,000",
        TextColor3 = Color3.fromRGB(255, 200, 50),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 13,
    })

    -- Close Button
    local closeButton = Create("TextButton", {
        Name = "CloseButton",
        Parent = headerBar,
        Position = UDim2.new(1, -42, 0, 10),
        Size = UDim2.new(0, 30, 0, 30),
        BackgroundColor3 = Color3.fromRGB(220, 70, 70),
        Text = "X",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = closeButton})

    -- Category Tabs
    local tabsFrame = Create("Frame", {
        Name = "CategoryTabs",
        Parent = mainFrame,
        Position = UDim2.new(0, 0, 0, 54),
        Size = UDim2.new(1, 0, 0, 42),
        BackgroundColor3 = Color3.fromRGB(70, 75, 110),
        BorderSizePixel = 0,
        ZIndex = 11,
    })
    Create("UIListLayout", {
        FillDirection = Enum.FillDirection.Horizontal,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Center,
        Padding = UDim.new(0, 6),
        Parent = tabsFrame,
    })

    UI.Tabs = {}
    for _, cat in ipairs(CONFIG.Categories) do
        local tabBtn = Create("TextButton", {
            Name = cat.Id .. "Tab",
            Parent = tabsFrame,
            Size = UDim2.new(0, 110, 0, 32),
            BackgroundColor3 = cat.Id == "Featured" and Color3.fromRGB(85, 90, 130) or Color3.fromRGB(60, 65, 100),
            Text = "  " .. cat.Label,
            TextColor3 = cat.Id == "Featured" and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(200, 200, 220),
            TextSize = 14,
            Font = Enum.Font.GothamBold,
            ZIndex = 12,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = tabBtn})
        UI.Tabs[cat.Id] = {Button = tabBtn, Color = cat.Color}
    end

    -- Item Grid
    local itemGrid = Create("ScrollingFrame", {
        Name = "ItemGrid",
        Parent = mainFrame,
        Position = UDim2.new(0, 10, 0, 100),
        Size = UDim2.new(1, -20, 1, -110),
        BackgroundTransparency = 1,
        ScrollBarThickness = 6,
        ScrollBarImageColor3 = Color3.fromRGB(120, 120, 140),
        CanvasSize = UDim2.new(0, 0, 0, 0),
        ZIndex = 11,
    })
    UI.ItemGrid = itemGrid

    Create("UIGridLayout", {
        CellSize = UDim2.new(0, 190, 0, 210),
        CellPadding = UDim2.new(0, 10, 0, 10),
        SortOrder = Enum.SortOrder.Name,
        Parent = itemGrid,
    })

    -- Purchase Prompt Overlay
    local purchasePrompt = Create("Frame", {
        Name = "PurchasePrompt",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        Size = UDim2.new(0, 360, 0, 320),
        BackgroundColor3 = Color3.fromRGB(250, 250, 255),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 200,
    })
    UI.PurchasePrompt = purchasePrompt
    Create("UICorner", {CornerRadius = UDim.new(0, 16), Parent = purchasePrompt})
    Create("UIStroke", {Color = Color3.fromRGB(60, 180, 80), Thickness = 2, Parent = purchasePrompt})

    Create("TextLabel", {
        Name = "PromptTitle",
        Parent = purchasePrompt,
        Position = UDim2.new(0, 0, 0, 12),
        Size = UDim2.new(1, 0, 0, 30),
        BackgroundTransparency = 1,
        Text = "CONFIRM PURCHASE",
        TextColor3 = Color3.fromRGB(50, 55, 90),
        TextSize = 22,
        Font = Enum.Font.GothamBlack,
        ZIndex = 201,
    })

    UI.PromptImage = Create("ImageLabel", {
        Name = "PromptImage",
        Parent = purchasePrompt,
        Position = UDim2.new(0.5, -55, 0, 48),
        Size = UDim2.new(0, 110, 0, 110),
        BackgroundTransparency = 1,
        Image = "",
        ZIndex = 201,
    })

    UI.PromptName = Create("TextLabel", {
        Name = "PromptName",
        Parent = purchasePrompt,
        Position = UDim2.new(0, 0, 0, 165),
        Size = UDim2.new(1, 0, 0, 26),
        BackgroundTransparency = 1,
        Text = "Item Name",
        TextColor3 = Color3.fromRGB(50, 55, 90),
        TextSize = 20,
        Font = Enum.Font.GothamBold,
        ZIndex = 201,
    })

    UI.PromptDesc = Create("TextLabel", {
        Name = "PromptDesc",
        Parent = purchasePrompt,
        Position = UDim2.new(0, 15, 0, 193),
        Size = UDim2.new(1, -30, 0, 20),
        BackgroundTransparency = 1,
        Text = "Item description",
        TextColor3 = Color3.fromRGB(120, 120, 140),
        TextSize = 13,
        Font = Enum.Font.Gotham,
        ZIndex = 201,
    })

    UI.PromptPrice = Create("TextLabel", {
        Name = "PromptPrice",
        Parent = purchasePrompt,
        Position = UDim2.new(0, 0, 0, 218),
        Size = UDim2.new(1, 0, 0, 22),
        BackgroundTransparency = 1,
        Text = "R$ 99",
        TextColor3 = Color3.fromRGB(80, 180, 80),
        TextSize = 18,
        Font = Enum.Font.GothamBlack,
        ZIndex = 201,
    })

    local buyRobuxBtn = Create("TextButton", {
        Name = "BuyRobuxButton",
        Parent = purchasePrompt,
        Position = UDim2.new(0, 20, 0, 255),
        Size = UDim2.new(0, 155, 0, 42),
        BackgroundColor3 = Color3.fromRGB(60, 180, 80),
        Text = "PURCHASE",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBlack,
        ZIndex = 201,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = buyRobuxBtn})
    UI.BuyRobuxButton = buyRobuxBtn

    local cancelBtn = Create("TextButton", {
        Name = "CancelButton",
        Parent = purchasePrompt,
        Position = UDim2.new(0, 185, 0, 255),
        Size = UDim2.new(0, 155, 0, 42),
        BackgroundColor3 = Color3.fromRGB(180, 70, 70),
        Text = "CANCEL",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBlack,
        ZIndex = 201,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = cancelBtn})
    UI.CancelPromptButton = cancelBtn

    -- Toast Notification
    UI.ToastFrame = Create("Frame", {
        Name = "ToastNotification",
        Parent = screenGui,
        AnchorPoint = Vector2.new(1, 1),
        Position = UDim2.new(1, -15, 1, 80),
        Size = UDim2.new(0, 280, 0, 50),
        BackgroundColor3 = Color3.fromRGB(60, 180, 80),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 500,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 12), Parent = UI.ToastFrame})
    UI.ToastText = Create("TextLabel", {
        Name = "ToastText",
        Parent = UI.ToastFrame,
        Position = UDim2.new(0, 15, 0, 0),
        Size = UDim2.new(1, -30, 1, 0),
        BackgroundTransparency = 1,
        Text = "Purchase successful!",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 14,
        Font = Enum.Font.GothamBold,
        ZIndex = 501,
    })

    return UI
end

-- ============================================
-- ITEM CARD CREATION
-- ============================================
function UI.CreateItemCard(itemData, index)
    local card = Create("Frame", {
        Name = "ItemCard_" .. string.format("%02d", index),
        Parent = UI.ItemGrid,
        Size = UDim2.new(0, 190, 0, 210),
        BackgroundColor3 = Color3.fromRGB(255, 255, 255),
        BorderSizePixel = 0,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = card})
    Create("UIStroke", {
        Color = Color3.fromRGB(200, 205, 220),
        Thickness = 1,
        Parent = card,
    })

    -- Featured badge (if featured)
    if itemData.Featured then
        local badge = Create("Frame", {
            Name = "FeaturedBadge",
            Parent = card,
            Position = UDim2.new(0, 6, 0, 6),
            Size = UDim2.new(0, 65, 0, 20),
            BackgroundColor3 = Color3.fromRGB(255, 160, 30),
            BorderSizePixel = 0,
            ZIndex = 14,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 6), Parent = badge})
        Create("TextLabel", {
            Parent = badge,
            Size = UDim2.new(1, 0, 1, 0),
            BackgroundTransparency = 1,
            Text = "FEATURED",
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextSize = 10,
            Font = Enum.Font.GothamBold,
            ZIndex = 15,
        })
    end

    -- Item Image
    local itemImage = Create("ImageLabel", {
        Name = "ItemImage",
        Parent = card,
        Position = UDim2.new(0.5, -55, 0, 10),
        Size = UDim2.new(0, 110, 0, 100),
        BackgroundTransparency = 1,
        Image = itemData.Icon or "",
        ZIndex = 13,
    })

    -- Item Name
    Create("TextLabel", {
        Name = "ItemName",
        Parent = card,
        Position = UDim2.new(0, 0, 0, 116),
        Size = UDim2.new(1, 0, 0, 22),
        BackgroundTransparency = 1,
        Text = itemData.Name or "Unknown",
        TextColor3 = Color3.fromRGB(50, 55, 80),
        TextSize = 15,
        Font = Enum.Font.GothamBold,
        ZIndex = 13,
    })

    -- Item Description
    Create("TextLabel", {
        Name = "ItemDesc",
        Parent = card,
        Position = UDim2.new(0, 8, 0, 138),
        Size = UDim2.new(1, -16, 0, 16),
        BackgroundTransparency = 1,
        Text = itemData.Description or "",
        TextColor3 = Color3.fromRGB(130, 130, 150),
        TextSize = 11,
        Font = Enum.Font.Gotham,
        TextWrapped = true,
        ZIndex = 13,
    })

    -- Price Frame
    local priceColor = CONFIG.CurrencyTypeColors[itemData.CurrencyType or "Robux"] or CONFIG.CurrencyTypeColors.Robux
    local priceBtn = Create("TextButton", {
        Name = "PriceButton",
        Parent = card,
        Position = UDim2.new(0.5, -70, 0, 162),
        Size = UDim2.new(0, 140, 0, 36),
        BackgroundColor3 = priceColor,
        Text = "  " .. FormatNumber(itemData.Price),
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 15,
        Font = Enum.Font.GothamBold,
        ZIndex = 13,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = priceBtn})

    -- Owned badge for gamepasses
    if itemData.Type == "Gamepass" and itemData.Owned then
        priceBtn.Visible = false
        local ownedBadge = Create("Frame", {
            Name = "OwnedBadge",
            Parent = card,
            Position = UDim2.new(0.5, -50, 0, 162),
            Size = UDim2.new(0, 100, 0, 32),
            BackgroundColor3 = Color3.fromRGB(100, 180, 100),
            BorderSizePixel = 0,
            ZIndex = 13,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = ownedBadge})
        Create("TextLabel", {
            Parent = ownedBadge,
            Size = UDim2.new(1, 0, 1, 0),
            BackgroundTransparency = 1,
            Text = "OWNED",
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextSize = 13,
            Font = Enum.Font.GothamBold,
            ZIndex = 14,
        })
    end

    return {
        Frame = card,
        PriceButton = priceBtn,
        Data = itemData,
    }
end

-- ============================================
-- LOGIC
-- ============================================
local Logic = {}

function Logic.SetupInteractions()
    -- Close button
    UI.MainFrame.HeaderBar.CloseButton.MouseButton1Click:Connect(function()
        Logic.Hide()
    end)

    -- Category tabs
    for catId, tabData in pairs(UI.Tabs) do
        tabData.Button.MouseButton1Click:Connect(function()
            Logic.SetCategory(catId)
        end)
    end

    -- Purchase prompt buttons
    UI.BuyRobuxButton.MouseButton1Click:Connect(function()
        Logic.ConfirmPurchase()
    end)
    UI.CancelPromptButton.MouseButton1Click:Connect(function()
        Logic.HidePurchasePrompt()
    end)

    -- MarketplaceService callbacks
    MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, gamePassId, wasPurchased)
        if player == Players.LocalPlayer and wasPurchased then
            Logic.ShowToast("Gamepass purchased successfully!")
            Logic.RefreshShop()
        end
    end)

    MarketplaceService.PromptProductPurchaseFinished:Connect(function(userId, productId, wasPurchased)
        if userId == Players.LocalPlayer.UserId and wasPurchased then
            Logic.ShowToast("Purchase completed!")
            Logic.RefreshBalances()
        end
    end)
end

function Logic.LoadShopData()
    -- Demo data - in production: RequestShopData:InvokeServer()
    State.ShopItems = {
        -- Featured
        {
            Id = "vip_pass",
            Name = "VIP Pass",
            Description = "Exclusive VIP perks and bonuses!",
            Category = "Gamepasses",
            Type = "Gamepass",
            Price = 399,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            Featured = true,
            GamepassId = 12345678,
            Owned = false,
        },
        {
            Id = "starter_pack",
            Name = "Starter Pack",
            Description = "Perfect for new players!",
            Category = "Featured",
            Type = "Product",
            Price = 49,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            Featured = true,
            ProductId = 87654321,
        },
        -- Gamepasses
        {
            Id = "2x_coins",
            Name = "2x Coins",
            Description = "Double coins forever!",
            Category = "Gamepasses",
            Type = "Gamepass",
            Price = 249,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            GamepassId = 12345679,
            Owned = false,
        },
        {
            Id = "2x_xp",
            Name = "2x XP Boost",
            Description = "Level up twice as fast!",
            Category = "Gamepasses",
            Type = "Gamepass",
            Price = 299,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            GamepassId = 12345680,
            Owned = false,
        },
        -- Currency
        {
            Id = "coins_1k",
            Name = "1,000 Coins",
            Description = "A small coin boost",
            Category = "Currency",
            Type = "Product",
            Price = 49,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            ProductId = 87654322,
        },
        {
            Id = "coins_5k",
            Name = "5,000 Coins",
            Description = "Great value pack!",
            Category = "Currency",
            Type = "Product",
            Price = 199,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            ProductId = 87654323,
        },
        {
            Id = "coins_25k",
            Name = "25,000 Coins",
            Description = "Best deal for coins!",
            Category = "Currency",
            Type = "Product",
            Price = 799,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            ProductId = 87654324,
        },
        -- Boosts
        {
            Id = "speed_boost",
            Name = "Speed Boost",
            Description = "2x speed for 1 hour",
            Category = "Boosts",
            Type = "Product",
            Price = 29,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            ProductId = 87654325,
        },
        {
            Id = "luck_boost",
            Name = "Luck Boost",
            Description = "Better drops for 2 hours",
            Category = "Boosts",
            Type = "Product",
            Price = 39,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            ProductId = 87654326,
        },
        -- Cosmetics
        {
            Id = "rainbow_trail",
            Name = "Rainbow Trail",
            Description = "Leave a rainbow behind!",
            Category = "Cosmetics",
            Type = "Product",
            Price = 149,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            ProductId = 87654327,
        },
        {
            Id = "golden_skin",
            Name = "Golden Skin",
            Description = "Shine like gold!",
            Category = "Cosmetics",
            Type = "Product",
            Price = 99,
            CurrencyType = "Robux",
            Icon = "rbxassetid://0",
            ProductId = 87654328,
        },
    }

    State.CoinBalance = 5000
    State.GemBalance = 1250

    Logic.RefreshBalances()
    Logic.RefreshItemGrid()
end

function Logic.RefreshBalances()
    UI.CoinsAmount.Text = FormatNumber(State.CoinBalance)
    UI.GemsAmount.Text = FormatNumber(State.GemBalance)
end

function Logic.RefreshItemGrid()
    -- Clear existing
    for _, child in ipairs(UI.ItemGrid:GetChildren()) do
        if child:IsA("Frame") then child:Destroy() end
    end
    UI.ItemCards = {}

    -- Filter items
    local filtered = {}
    for _, item in ipairs(State.ShopItems) do
        local show = false
        if State.CurrentCategory == "Featured" then
            show = item.Featured or false
        else
            show = item.Category == State.CurrentCategory
        end
        if show then
            table.insert(filtered, item)
        end
    end

    -- Create cards
    for i, item in ipairs(filtered) do
        local card = UI.CreateItemCard(item, i)
        table.insert(UI.ItemCards, card)

        -- Card hover
        card.Frame.MouseEnter:Connect(function()
            Tween(card.Frame, {
                Size = UDim2.new(0, 190 * CONFIG.CardHoverScale, 0, 210 * CONFIG.CardHoverScale)
            }, 0.15)
        end)
        card.Frame.MouseLeave:Connect(function()
            Tween(card.Frame, {Size = UDim2.new(0, 190, 0, 210)}, 0.15)
        end)

        -- Purchase click
        card.PriceButton.MouseButton1Click:Connect(function()
            Logic.OnPurchaseClick(item)
        end)
    end

    -- Update canvas
    local rows = math.ceil(#filtered / CONFIG.ItemsPerRow)
    UI.ItemGrid.CanvasSize = UDim2.new(0, 0, 0, rows * 220)
end

function Logic.SetCategory(categoryId)
    State.CurrentCategory = categoryId

    -- Update tab visuals
    for catId, tabData in pairs(UI.Tabs) do
        local isActive = catId == categoryId
        tabData.Button.BackgroundColor3 = isActive
            and Color3.fromRGB(85, 90, 130) or Color3.fromRGB(60, 65, 100)
        tabData.Button.TextColor3 = isActive
            and Color3.fromRGB(255, 255, 255) or Color3.fromRGB(200, 200, 220)
    end

    Logic.RefreshItemGrid()
end

function Logic.OnPurchaseClick(item)
    if item.Type == "Gamepass" and item.GamepassId then
        -- Check if owned
        local isOwned = State.OwnedGamepasses[item.GamepassId]
        if isOwned then
            Logic.ShowToast("You already own this gamepass!")
            return
        end
        -- Prompt gamepass purchase
        MarketplaceService:PromptGamePassPurchase(player, item.GamepassId)
    elseif item.Type == "Product" and item.ProductId then
        -- Store for confirmation
        State.SelectedItem = item
        Logic.ShowPurchasePrompt(item)
    end
end

function Logic.ShowPurchasePrompt(item)
    UI.PromptImage.Image = item.Icon or ""
    UI.PromptName.Text = item.Name
    UI.PromptDesc.Text = item.Description or ""

    local priceSymbol = item.CurrencyType == "Robux" and "R$ " or ""
    UI.PromptPrice.Text = priceSymbol .. FormatNumber(item.Price)
    UI.PromptPrice.TextColor3 = CONFIG.CurrencyTypeColors[item.CurrencyType] or CONFIG.CurrencyTypeColors.Robux

    UI.PurchasePrompt.Visible = true
    UI.PurchasePrompt.Size = UDim2.new(0, 320, 0, 290)
    TweenBounce(UI.PurchasePrompt, {Size = UDim2.new(0, 360, 0, 320)}, 0.3)
end

function Logic.HidePurchasePrompt()
    Tween(UI.PurchasePrompt, {Size = UDim2.new(0, 320, 0, 290)}, 0.2)
    task.delay(0.2, function()
        UI.PurchasePrompt.Visible = false
    end)
end

function Logic.ConfirmPurchase()
    if not State.SelectedItem then return end

    local item = State.SelectedItem

    if item.Type == "Product" and item.ProductId then
        -- Prompt developer product purchase
        MarketplaceService:PromptProductPurchase(player, item.ProductId)
    end

    Logic.HidePurchasePrompt()
end

function Logic.ShowToast(message)
    UI.ToastText.Text = message
    UI.ToastFrame.Visible = true
    UI.ToastFrame.Position = UDim2.new(1, -15, 1, 80)

    Tween(UI.ToastFrame, {Position = UDim2.new(1, -15, 1, -15)}, 0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out)

    task.delay(3, function()
        Tween(UI.ToastFrame, {Position = UDim2.new(1, -15, 1, 80)}, 0.3)
        task.delay(0.3, function()
            UI.ToastFrame.Visible = false
        end)
    end)
end

function Logic.Show()
    State.IsVisible = true
    UI.ScreenGui.Enabled = true
    UI.MainFrame.Size = UDim2.new(0, 540, 0, 400)
    Tween(UI.MainFrame, {Size = UDim2.new(0, 600, 0, 440)}, 0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
    Logic.LoadShopData()
end

function Logic.Hide()
    State.IsVisible = false
    Tween(UI.MainFrame, {Size = UDim2.new(0, 540, 0, 400)}, 0.2)
    task.delay(0.2, function()
        if not State.IsVisible then
            UI.ScreenGui.Enabled = false
        end
    end)
end

function Logic.Toggle()
    if State.IsVisible then Logic.Hide() else Logic.Show() end
end

-- ============================================
-- INITIALIZATION
-- ============================================
UI.Build()
Logic.SetupInteractions()

-- Bind to key
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if input.KeyCode == Enum.KeyCode.B then
        Logic.Toggle()
    end
end)

print("Shop UI System initialized! Press 'B' to open shop.")
