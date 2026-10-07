--[[
    Pet Shop System - Client
    Features: 6 pet cards with rarity badges, coin balance, buy/equip, preview panel
    Place in: StarterPlayer > StarterPlayerScripts
--]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local MarketplaceService = game:GetService("MarketplaceService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Remote Events
local PetShopRemotes = ReplicatedStorage:WaitForChild("PetShopRemotes")
local RequestPets = PetShopRemotes:WaitForChild("RequestPets")
local BuyPet = PetShopRemotes:WaitForChild("BuyPet")
local EquipPet = PetShopRemotes:WaitForChild("EquipPet")
local UnequipPet = PetShopRemotes:WaitForChild("UnequipPet")
local GetCoinBalance = PetShopRemotes:WaitForChild("GetCoinBalance")

-- ============================================
-- CONFIGURATION
-- ============================================
local CONFIG = {
    AnimSpeed = 0.3,
    CardHoverScale = 1.04,
    PetsPerPage = 6,
    RarityColors = {
        Common = Color3.fromRGB(169, 169, 169),
        Uncommon = Color3.fromRGB(50, 180, 50),
        Rare = Color3.fromRGB(50, 120, 220),
        Epic = Color3.fromRGB(148, 50, 200),
        Legendary = Color3.fromRGB(220, 150, 30),
        Mythic = Color3.fromRGB(220, 50, 80),
    },
    RarityGlows = {
        Common = 1,
        Uncommon = 2,
        Rare = 3,
        Epic = 4,
        Legendary = 5,
        Mythic = 6,
    },
}

-- ============================================
-- STATE
-- ============================================
local State = {
    IsVisible = false,
    Pets = {},
    OwnedPets = {},
    EquippedPet = nil,
    SelectedPet = nil,
    CoinBalance = 0,
    CurrentFilter = "All",
    PurchasePending = false,
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
        Name = "PetShopGui",
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
        BackgroundTransparency = 0.5,
        BorderSizePixel = 0,
        ZIndex = 1,
    })

    -- Main Frame
    local mainFrame = Create("Frame", {
        Name = "MainFrame",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        Size = UDim2.new(0, 650, 0, 450),
        BackgroundColor3 = Color3.fromRGB(50, 45, 65),
        BorderSizePixel = 0,
        ClipsDescendants = true,
        ZIndex = 10,
    })
    UI.MainFrame = mainFrame

    Create("UICorner", {CornerRadius = UDim.new(0, 16), Parent = mainFrame})
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(55, 50, 75)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(42, 38, 58)),
        }),
        Rotation = 135,
        Parent = mainFrame,
    })

    -- Header Frame
    local headerFrame = Create("Frame", {
        Name = "HeaderFrame",
        Parent = mainFrame,
        Size = UDim2.new(1, 0, 0, 56),
        BackgroundColor3 = Color3.fromRGB(60, 55, 80),
        BorderSizePixel = 0,
        ZIndex = 11,
    })

    -- Shop Title
    Create("TextLabel", {
        Name = "ShopTitle",
        Parent = headerFrame,
        Position = UDim2.new(0, 18, 0, 0),
        Size = UDim2.new(0, 200, 1, 0),
        BackgroundTransparency = 1,
        Text = "PET SHOP",
        TextColor3 = Color3.fromRGB(255, 220, 100),
        TextSize = 26,
        Font = Enum.Font.GothamBlack,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
    })

    -- Coin Display
    local coinDisplay = Create("Frame", {
        Name = "CoinDisplay",
        Parent = headerFrame,
        Position = UDim2.new(1, -160, 0.5, -17),
        Size = UDim2.new(0, 130, 0, 34),
        BackgroundColor3 = Color3.fromRGB(45, 40, 30),
        BorderSizePixel = 0,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = coinDisplay})
    Create("UIStroke", {Color = Color3.fromRGB(200, 160, 50), Thickness = 1, Parent = coinDisplay})

    UI.CoinAmount = Create("TextLabel", {
        Name = "CoinAmount",
        Parent = coinDisplay,
        Position = UDim2.new(0, 32, 0, 0),
        Size = UDim2.new(1, -36, 1, 0),
        BackgroundTransparency = 1,
        Text = "12,500",
        TextColor3 = Color3.fromRGB(255, 200, 50),
        TextSize = 18,
        Font = Enum.Font.GothamBold,
        ZIndex = 13,
    })

    -- Close Button
    local closeButton = Create("TextButton", {
        Name = "CloseButton",
        Parent = headerFrame,
        Position = UDim2.new(1, -42, 0, 10),
        Size = UDim2.new(0, 32, 0, 32),
        BackgroundColor3 = Color3.fromRGB(200, 60, 60),
        Text = "X",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 18,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = closeButton})

    -- Category Tabs
    local tabsFrame = Create("Frame", {
        Name = "CategoryTabs",
        Parent = mainFrame,
        Position = UDim2.new(0, 0, 0, 56),
        Size = UDim2.new(1, 0, 0, 38),
        BackgroundColor3 = Color3.fromRGB(48, 43, 65),
        BorderSizePixel = 0,
        ZIndex = 11,
    })
    Create("UIListLayout", {
        FillDirection = Enum.FillDirection.Horizontal,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Center,
        Padding = UDim.new(0, 8),
        Parent = tabsFrame,
    })

    local tabNames = {"All", "Common", "Rare", "Legendary"}
    UI.Tabs = {}
    for _, tabName in ipairs(tabNames) do
        local tabBtn = Create("TextButton", {
            Name = tabName .. "Tab",
            Parent = tabsFrame,
            Size = UDim2.new(0, 90, 0, 30),
            BackgroundColor3 = tabName == "All" and Color3.fromRGB(80, 70, 110) or Color3.fromRGB(55, 50, 75),
            Text = tabName,
            TextColor3 = Color3.fromRGB(220, 215, 240),
            TextSize = 14,
            Font = Enum.Font.GothamBold,
            ZIndex = 12,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = tabBtn})
        UI.Tabs[tabName] = tabBtn
    end

    -- Content Area
    local contentArea = Create("Frame", {
        Name = "ContentArea",
        Parent = mainFrame,
        Position = UDim2.new(0, 0, 0, 94),
        Size = UDim2.new(1, 0, 1, -94),
        BackgroundTransparency = 1,
        ZIndex = 11,
    })

    -- Pet Grid (Left side)
    local petGrid = Create("ScrollingFrame", {
        Name = "PetGrid",
        Parent = contentArea,
        Position = UDim2.new(0, 10, 0, 0),
        Size = UDim2.new(0, 405, 1, -10),
        BackgroundTransparency = 1,
        ScrollBarThickness = 6,
        ScrollBarImageColor3 = Color3.fromRGB(80, 75, 100),
        CanvasSize = UDim2.new(0, 0, 0, 0),
        ZIndex = 12,
    })
    UI.PetGrid = petGrid

    Create("UIGridLayout", {
        CellSize = UDim2.new(0, 190, 0, 210),
        CellPadding = UDim2.new(0, 12, 0, 12),
        SortOrder = Enum.SortOrder.Name,
        Parent = petGrid,
    })

    -- Preview Panel (Right side)
    local previewPanel = Create("Frame", {
        Name = "PreviewPanel",
        Parent = contentArea,
        Position = UDim2.new(0, 420, 0, 5),
        Size = UDim2.new(0, 215, 1, -15),
        BackgroundColor3 = Color3.fromRGB(45, 42, 60),
        BorderSizePixel = 0,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 12), Parent = previewPanel})

    -- Panel Title
    Create("TextLabel", {
        Name = "PanelTitle",
        Parent = previewPanel,
        Position = UDim2.new(0, 0, 0, 8),
        Size = UDim2.new(1, 0, 0, 26),
        BackgroundTransparency = 1,
        Text = "YOUR PET",
        TextColor3 = Color3.fromRGB(200, 190, 230),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 13,
    })

    -- Preview Image Frame
    local previewImageFrame = Create("Frame", {
        Name = "PreviewImageFrame",
        Parent = previewPanel,
        Position = UDim2.new(0.5, -80, 0, 38),
        Size = UDim2.new(0, 160, 0, 160),
        BackgroundColor3 = Color3.fromRGB(55, 52, 72),
        BorderSizePixel = 0,
        ZIndex = 13,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 12), Parent = previewImageFrame})
    UI.PreviewImage = Create("ImageLabel", {
        Name = "PreviewImage",
        Parent = previewImageFrame,
        Size = UDim2.new(1, -12, 1, -12),
        Position = UDim2.new(0, 6, 0, 6),
        BackgroundTransparency = 1,
        Image = "",
        ZIndex = 14,
    })

    -- Equipped Badge
    UI.EquippedBadge = Create("Frame", {
        Name = "EquippedBadge",
        Parent = previewImageFrame,
        Position = UDim2.new(0, 6, 0, 6),
        Size = UDim2.new(0, 70, 0, 22),
        BackgroundColor3 = Color3.fromRGB(50, 180, 80),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 15,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 6), Parent = UI.EquippedBadge})
    Create("TextLabel", {
        Parent = UI.EquippedBadge,
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Text = "EQUIPPED",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 11,
        Font = Enum.Font.GothamBold,
        ZIndex = 16,
    })

    -- Equipped Name
    UI.EquippedName = Create("TextLabel", {
        Name = "EquippedName",
        Parent = previewPanel,
        Position = UDim2.new(0, 0, 0, 205),
        Size = UDim2.new(1, 0, 0, 22),
        BackgroundTransparency = 1,
        Text = "No Pet Equipped",
        TextColor3 = Color3.fromRGB(200, 200, 220),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 13,
    })

    -- Equipped Rarity
    UI.EquippedRarity = Create("TextLabel", {
        Name = "EquippedRarity",
        Parent = previewPanel,
        Position = UDim2.new(0, 0, 0, 228),
        Size = UDim2.new(1, 0, 0, 18),
        BackgroundTransparency = 1,
        Text = "Select a pet",
        TextColor3 = Color3.fromRGB(160, 160, 180),
        TextSize = 13,
        Font = Enum.Font.GothamSemibold,
        ZIndex = 13,
    })

    -- Equipped Stats Bars
    local statsFrame = Create("Frame", {
        Name = "EquippedStats",
        Parent = previewPanel,
        Position = UDim2.new(0, 12, 0, 255),
        Size = UDim2.new(1, -24, 0, 100),
        BackgroundTransparency = 1,
        ZIndex = 13,
    })

    local statNames = {"Speed", "Power", "Luck"}
    local statColors = {
        Speed = Color3.fromRGB(50, 180, 220),
        Power = Color3.fromRGB(220, 80, 60),
        Luck = Color3.fromRGB(180, 220, 60),
    }
    UI.StatBars = {}
    for i, statName in ipairs(statNames) do
        local yPos = (i - 1) * 32
        Create("TextLabel", {
            Parent = statsFrame,
            Position = UDim2.new(0, 0, 0, yPos),
            Size = UDim2.new(0, 55, 0, 18),
            BackgroundTransparency = 1,
            Text = statName,
            TextColor3 = Color3.fromRGB(180, 175, 200),
            TextSize = 12,
            Font = Enum.Font.GothamSemibold,
            TextXAlignment = Enum.TextXAlignment.Left,
            ZIndex = 14,
        })
        local barBg = Create("Frame", {
            Parent = statsFrame,
            Position = UDim2.new(0, 58, 0, yPos + 2),
            Size = UDim2.new(1, -60, 0, 14),
            BackgroundColor3 = Color3.fromRGB(35, 32, 48),
            BorderSizePixel = 0,
            ZIndex = 14,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 7), Parent = barBg})
        local barFill = Create("Frame", {
            Parent = barBg,
            Size = UDim2.new(0, 0, 1, 0),
            BackgroundColor3 = statColors[statName],
            BorderSizePixel = 0,
            ZIndex = 15,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 7), Parent = barFill})
        UI.StatBars[statName] = barFill
    end

    -- Equip Action Button
    UI.EquipButton = Create("TextButton", {
        Name = "EquipActionButton",
        Parent = previewPanel,
        Position = UDim2.new(0.5, -80, 1, -48),
        Size = UDim2.new(0, 160, 0, 38),
        BackgroundColor3 = Color3.fromRGB(50, 160, 70),
        Text = "EQUIP",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        Visible = false,
        ZIndex = 13,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = UI.EquipButton})

    -- Unequip Action Button
    UI.UnequipButton = Create("TextButton", {
        Name = "UnequipActionButton",
        Parent = previewPanel,
        Position = UDim2.new(0.5, -80, 1, -48),
        Size = UDim2.new(0, 160, 0, 38),
        BackgroundColor3 = Color3.fromRGB(160, 80, 50),
        Text = "UNEQUIP",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        Visible = false,
        ZIndex = 13,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = UI.UnequipButton})

    -- Purchase Modal
    local purchaseModal = Create("Frame", {
        Name = "PurchaseModal",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        Size = UDim2.new(0, 340, 0, 280),
        BackgroundColor3 = Color3.fromRGB(45, 42, 62),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 200,
    })
    UI.PurchaseModal = purchaseModal
    Create("UICorner", {CornerRadius = UDim.new(0, 16), Parent = purchaseModal})
    Create("UIStroke", {Color = Color3.fromRGB(200, 170, 60), Thickness = 2, Parent = purchaseModal})

    Create("TextLabel", {
        Name = "ModalTitle",
        Parent = purchaseModal,
        Position = UDim2.new(0, 0, 0, 12),
        Size = UDim2.new(1, 0, 0, 30),
        BackgroundTransparency = 1,
        Text = "CONFIRM PURCHASE",
        TextColor3 = Color3.fromRGB(255, 220, 100),
        TextSize = 20,
        Font = Enum.Font.GothamBlack,
        ZIndex = 201,
    })
    UI.ModalPetImage = Create("ImageLabel", {
        Name = "ModalPetImage",
        Parent = purchaseModal,
        Position = UDim2.new(0.5, -50, 0, 48),
        Size = UDim2.new(0, 100, 0, 100),
        BackgroundTransparency = 1,
        Image = "",
        ZIndex = 201,
    })
    UI.ModalPetName = Create("TextLabel", {
        Name = "ModalPetName",
        Parent = purchaseModal,
        Position = UDim2.new(0, 0, 0, 152),
        Size = UDim2.new(1, 0, 0, 24),
        BackgroundTransparency = 1,
        Text = "Pet Name",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 18,
        Font = Enum.Font.GothamBold,
        ZIndex = 201,
    })
    UI.ModalPrice = Create("TextLabel", {
        Name = "ModalPrice",
        Parent = purchaseModal,
        Position = UDim2.new(0, 0, 0, 178),
        Size = UDim2.new(1, 0, 0, 22),
        BackgroundTransparency = 1,
        Text = "2,500 Coins",
        TextColor3 = Color3.fromRGB(255, 200, 50),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 201,
    })
    local confirmBtn = Create("TextButton", {
        Name = "ConfirmButton",
        Parent = purchaseModal,
        Position = UDim2.new(0, 20, 0, 215),
        Size = UDim2.new(0, 135, 0, 40),
        BackgroundColor3 = Color3.fromRGB(50, 180, 80),
        Text = "BUY",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 18,
        Font = Enum.Font.GothamBlack,
        ZIndex = 201,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = confirmBtn})
    UI.ConfirmPurchaseButton = confirmBtn

    local cancelBtn = Create("TextButton", {
        Name = "CancelButton",
        Parent = purchaseModal,
        Position = UDim2.new(0, 185, 0, 215),
        Size = UDim2.new(0, 135, 0, 40),
        BackgroundColor3 = Color3.fromRGB(160, 60, 60),
        Text = "CANCEL",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 18,
        Font = Enum.Font.GothamBlack,
        ZIndex = 201,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = cancelBtn})
    UI.CancelPurchaseButton = cancelBtn

    -- Notification Frame
    UI.NotificationFrame = Create("Frame", {
        Name = "NotificationFrame",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0),
        Position = UDim2.new(0.5, 0, 0, -60),
        Size = UDim2.new(0, 300, 0, 44),
        BackgroundColor3 = Color3.fromRGB(50, 45, 65),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 500,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 10), Parent = UI.NotificationFrame})
    Create("UIStroke", {Color = Color3.fromRGB(80, 180, 80), Thickness = 2, Parent = UI.NotificationFrame})
    UI.NotificationText = Create("TextLabel", {
        Name = "NotificationText",
        Parent = UI.NotificationFrame,
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Text = "Purchase successful!",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 15,
        Font = Enum.Font.GothamBold,
        ZIndex = 501,
    })

    return UI
end

-- ============================================
-- PET CARD CREATION
-- ============================================
function UI.CreatePetCard(petData, index)
    local rarityColor = CONFIG.RarityColors[petData.Rarity] or CONFIG.RarityColors.Common
    local card = Create("Frame", {
        Name = "PetCard_" .. string.format("%02d", index),
        Parent = UI.PetGrid,
        Size = UDim2.new(0, 190, 0, 210),
        BackgroundColor3 = Color3.fromRGB(52, 48, 70),
        BorderSizePixel = 0,
        ZIndex = 13,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 12), Parent = card})
    local stroke = Create("UIStroke", {
        Color = rarityColor,
        Thickness = 2,
        Parent = card,
    })

    -- Pet Image
    local petImage = Create("ImageLabel", {
        Name = "PetImage",
        Parent = card,
        Position = UDim2.new(0.5, -60, 0, 8),
        Size = UDim2.new(0, 120, 0, 100),
        BackgroundTransparency = 1,
        Image = petData.Icon or "",
        ZIndex = 14,
    })

    -- Rarity Badge
    local badge = Create("Frame", {
        Name = "RarityBadge",
        Parent = card,
        Position = UDim2.new(0, 6, 0, 6),
        Size = UDim2.new(0, 70, 0, 20),
        BackgroundColor3 = rarityColor,
        BorderSizePixel = 0,
        ZIndex = 15,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 6), Parent = badge})
    Create("TextLabel", {
        Parent = badge,
        Size = UDim2.new(1, 0, 1, 0),
        BackgroundTransparency = 1,
        Text = string.upper(petData.Rarity or "Common"),
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 10,
        Font = Enum.Font.GothamBold,
        ZIndex = 16,
    })

    -- Pet Name
    Create("TextLabel", {
        Name = "PetName",
        Parent = card,
        Position = UDim2.new(0, 0, 0, 114),
        Size = UDim2.new(1, 0, 0, 22),
        BackgroundTransparency = 1,
        Text = petData.Name or "Unknown",
        TextColor3 = Color3.fromRGB(240, 235, 255),
        TextSize = 15,
        Font = Enum.Font.GothamBold,
        ZIndex = 14,
    })

    -- Pet Stats
    Create("TextLabel", {
        Name = "PetStats",
        Parent = card,
        Position = UDim2.new(0, 0, 0, 136),
        Size = UDim2.new(1, 0, 0, 16),
        BackgroundTransparency = 1,
        Text = string.format("SPD: %d | PWR: %d", petData.Stats.Speed, petData.Stats.Power),
        TextColor3 = Color3.fromRGB(160, 155, 180),
        TextSize = 11,
        Font = Enum.Font.Gotham,
        ZIndex = 14,
    })

    -- Price / Owned Button
    local priceBtn = Create("TextButton", {
        Name = "PriceButton",
        Parent = card,
        Position = UDim2.new(0.5, -70, 0, 160),
        Size = UDim2.new(0, 140, 0, 36),
        BackgroundColor3 = Color3.fromRGB(55, 130, 70),
        Text = "  " .. FormatNumber(petData.Price),
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 15,
        Font = Enum.Font.GothamBold,
        ZIndex = 14,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = priceBtn})

    return {
        Frame = card,
        Stroke = stroke,
        PetImage = petImage,
        PriceButton = priceBtn,
        Data = petData,
    }
end

-- ============================================
-- LOGIC
-- ============================================
local Logic = {}

function Logic.SetupInteractions()
    -- Close button
    UI.MainFrame.HeaderFrame.CloseButton.MouseButton1Click:Connect(function()
        Logic.Hide()
    end)

    -- Tab filtering
    for tabName, tabBtn in pairs(UI.Tabs) do
        tabBtn.MouseButton1Click:Connect(function()
            Logic.SetFilter(tabName)
        end)
    end

    -- Purchase buttons
    UI.ConfirmPurchaseButton.MouseButton1Click:Connect(function()
        Logic.ConfirmPurchase()
    end)
    UI.CancelPurchaseButton.MouseButton1Click:Connect(function()
        Logic.HidePurchaseModal()
    end)

    -- Equip / Unequip
    UI.EquipButton.MouseButton1Click:Connect(function()
        if State.SelectedPet then
            Logic.EquipPet(State.SelectedPet.Id)
        end
    end)
    UI.UnequipButton.MouseButton1Click:Connect(function()
        Logic.UnequipPet()
    end)
end

function Logic.LoadPets()
    -- In production: local pets = RequestPets:InvokeServer()
    -- Demo data
    State.Pets = {
        {
            Id = "pet_dragon",
            Name = "Fire Dragon",
            Rarity = "Legendary",
            Icon = "rbxassetid://12345",
            Price = 5000,
            Stats = {Speed = 85, Power = 95, Luck = 70},
            Description = "A mighty fire-breathing dragon.",
        },
        {
            Id = "pet_phoenix",
            Name = "Phoenix",
            Rarity = "Legendary",
            Icon = "rbxassetid://12346",
            Price = 4500,
            Stats = {Speed = 90, Power = 80, Luck = 85},
            Description = "Rises from the ashes.",
        },
        {
            Id = "pet_wolf",
            Name = "Shadow Wolf",
            Rarity = "Rare",
            Icon = "rbxassetid://12347",
            Price = 2500,
            Stats = {Speed = 92, Power = 65, Luck = 60},
            Description = "A loyal shadow companion.",
        },
        {
            Id = "pet_cat",
            Name = "Lucky Cat",
            Rarity = "Uncommon",
            Icon = "rbxassetid://12348",
            Price = 1000,
            Stats = {Speed = 60, Power = 40, Luck = 95},
            Description = "Brings good fortune.",
        },
        {
            Id = "pet_dog",
            Name = "Golden Retriever",
            Rarity = "Common",
            Icon = "rbxassetid://12349",
            Price = 500,
            Stats = {Speed = 70, Power = 50, Luck = 65},
            Description = "A faithful friend.",
        },
        {
            Id = "pet_unicorn",
            Name = "Rainbow Unicorn",
            Rarity = "Epic",
            Icon = "rbxassetid://12350",
            Price = 3500,
            Stats = {Speed = 80, Power = 70, Luck = 90},
            Description = "Sparkles with magic.",
        },
    }

    State.OwnedPets = {
        pet_dog = true, -- Demo: player owns the dog
    }
    State.EquippedPet = "pet_dog"

    Logic.RefreshPetGrid()
    Logic.RefreshPreview()
end

function Logic.RefreshPetGrid()
    -- Clear existing cards
    for _, child in ipairs(UI.PetGrid:GetChildren()) do
        if child:IsA("Frame") then child:Destroy() end
    end
    UI.PetCards = {}

    -- Create cards based on filter
    local index = 0
    for _, pet in ipairs(State.Pets) do
        if State.CurrentFilter == "All" or pet.Rarity == State.CurrentFilter then
            index = index + 1
            local card = UI.CreatePetCard(pet, index)
            table.insert(UI.PetCards, card)

            -- Setup card interactions
            card.Frame.MouseEnter:Connect(function()
                Tween(card.Frame, {Size = UDim2.new(0, 190 * CONFIG.CardHoverScale, 0, 210 * CONFIG.CardHoverScale)}, 0.15)
                card.Stroke.Thickness = 3 + (CONFIG.RarityGlows[pet.Rarity] or 1)
            end)
            card.Frame.MouseLeave:Connect(function()
                Tween(card.Frame, {Size = UDim2.new(0, 190, 0, 210)}, 0.15)
                card.Stroke.Thickness = 2
            end)

            card.PriceButton.MouseButton1Click:Connect(function()
                Logic.OnPriceButtonClick(pet)
            end)

            card.Frame.InputBegan:Connect(function(input)
                if input.UserInputType == Enum.UserInputType.MouseButton1 or
                   input.UserInputType == Enum.UserInputType.Touch then
                    Logic.SelectPet(pet)
                end
            end)
        end
    end

    -- Update canvas size
    local rows = math.ceil(index / 2)
    UI.PetGrid.CanvasSize = UDim2.new(0, 0, 0, rows * 222)
end

function Logic.OnPriceButtonClick(pet)
    local isOwned = State.OwnedPets[pet.Id]
    if isOwned then
        -- If owned, select and equip
        Logic.SelectPet(pet)
        Logic.EquipPet(pet.Id)
    else
        -- If not owned, show purchase modal
        Logic.ShowPurchaseModal(pet)
    end
end

function Logic.SelectPet(pet)
    State.SelectedPet = pet
    Logic.RefreshPreview()
end

function Logic.RefreshPreview()
    local pet = State.SelectedPet
    if not pet then
        -- Show equipped pet or empty state
        if State.EquippedPet then
            for _, p in ipairs(State.Pets) do
                if p.Id == State.EquippedPet then
                    pet = p
                    break
                end
            end
        end
    end

    if pet then
        UI.PreviewImage.Image = pet.Icon or ""
        UI.EquippedName.Text = pet.Name
        UI.EquippedName.TextColor3 = CONFIG.RarityColors[pet.Rarity] or Color3.fromRGB(255, 255, 255)
        UI.EquippedRarity.Text = pet.Rarity
        UI.EquippedRarity.TextColor3 = CONFIG.RarityColors[pet.Rarity] or Color3.fromRGB(200, 200, 200)

        -- Update stat bars with animation
        local maxStat = 100
        Tween(UI.StatBars.Speed, {Size = UDim2.new(math.clamp(pet.Stats.Speed / maxStat, 0, 1), 0, 1, 0)}, 0.4)
        Tween(UI.StatBars.Power, {Size = UDim2.new(math.clamp(pet.Stats.Power / maxStat, 0, 1), 0, 1, 0)}, 0.4)
        Tween(UI.StatBars.Luck, {Size = UDim2.new(math.clamp(pet.Stats.Luck / maxStat, 0, 1), 0, 1, 0)}, 0.4)

        -- Show equipped badge
        local isEquipped = State.EquippedPet == pet.Id
        UI.EquippedBadge.Visible = isEquipped
        UI.EquippedBadge.BackgroundColor3 = CONFIG.RarityColors[pet.Rarity]

        -- Show/hide equip/unequip buttons
        local isOwned = State.OwnedPets[pet.Id]
        if isEquipped then
            UI.EquipButton.Visible = false
            UI.UnequipButton.Visible = true
        elseif isOwned then
            UI.EquipButton.Visible = true
            UI.UnequipButton.Visible = false
        else
            UI.EquipButton.Visible = false
            UI.UnequipButton.Visible = false
        end
    else
        UI.PreviewImage.Image = ""
        UI.EquippedName.Text = "No Pet Equipped"
        UI.EquippedName.TextColor3 = Color3.fromRGB(200, 200, 220)
        UI.EquippedRarity.Text = "Select a pet"
        UI.EquippedBadge.Visible = false
        UI.EquipButton.Visible = false
        UI.UnequipButton.Visible = false
        Tween(UI.StatBars.Speed, {Size = UDim2.new(0, 0, 1, 0)}, 0.3)
        Tween(UI.StatBars.Power, {Size = UDim2.new(0, 0, 1, 0)}, 0.3)
        Tween(UI.StatBars.Luck, {Size = UDim2.new(0, 0, 1, 0)}, 0.3)
    end
end

function Logic.SetFilter(filter)
    State.CurrentFilter = filter

    -- Update tab visuals
    for tabName, tabBtn in pairs(UI.Tabs) do
        tabBtn.BackgroundColor3 = tabName == filter
            and Color3.fromRGB(80, 70, 110)
            or Color3.fromRGB(55, 50, 75)
    end

    Logic.RefreshPetGrid()
end

function Logic.ShowPurchaseModal(pet)
    if State.PurchasePending then return end

    UI.ModalPetImage.Image = pet.Icon or ""
    UI.ModalPetName.Text = pet.Name
    UI.ModalPetName.TextColor3 = CONFIG.RarityColors[pet.Rarity]
    UI.ModalPrice.Text = FormatNumber(pet.Price) .. " Coins"

    UI.PurchaseModal.Visible = true
    UI.PurchaseModal.Size = UDim2.new(0, 300, 0, 250)
    Tween(UI.PurchaseModal, {Size = UDim2.new(0, 340, 0, 280)}, 0.25, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
end

function Logic.HidePurchaseModal()
    Tween(UI.PurchaseModal, {Size = UDim2.new(0, 300, 0, 250)}, 0.2)
    task.delay(0.2, function()
        UI.PurchaseModal.Visible = false
    end)
end

function Logic.ConfirmPurchase()
    if State.PurchasePending then return end
    if not State.SelectedPet then return end

    State.PurchasePending = true
    UI.ConfirmPurchaseButton.Text = "Buying..."
    UI.ConfirmPurchaseButton.BackgroundColor3 = Color3.fromRGB(100, 100, 100)

    -- Fire server
    local result = BuyPet:InvokeServer(State.SelectedPet.Id)

    if result.Success then
        State.OwnedPets[State.SelectedPet.Id] = true
        State.CoinBalance = result.NewBalance or State.CoinBalance
        UI.CoinAmount.Text = FormatNumber(State.CoinBalance)

        Logic.ShowNotification("Purchase successful! You got " .. State.SelectedPet.Name)
        Logic.RefreshPetGrid()

        -- Auto-equip
        Logic.EquipPet(State.SelectedPet.Id)
    else
        Logic.ShowNotification(result.Message or "Purchase failed!")
    end

    UI.ConfirmPurchaseButton.Text = "BUY"
    UI.ConfirmPurchaseButton.BackgroundColor3 = Color3.fromRGB(50, 180, 80)
    State.PurchasePending = false
    Logic.HidePurchaseModal()
end

function Logic.EquipPet(petId)
    local result = EquipPet:InvokeServer(petId)
    if result.Success then
        State.EquippedPet = petId
        Logic.RefreshPreview()
        Logic.RefreshPetGrid()
        Logic.ShowNotification("Pet equipped!")
    end
end

function Logic.UnequipPet()
    local result = UnequipPet:InvokeServer()
    if result.Success then
        State.EquippedPet = nil
        Logic.RefreshPreview()
        Logic.ShowNotification("Pet unequipped!")
    end
end

function Logic.ShowNotification(message)
    UI.NotificationText.Text = message
    UI.NotificationFrame.Visible = true
    UI.NotificationFrame.Position = UDim2.new(0.5, 0, 0, -60)
    Tween(UI.NotificationFrame, {Position = UDim2.new(0.5, 0, 0, 20)}, 0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out)

    task.delay(2.5, function()
        Tween(UI.NotificationFrame, {Position = UDim2.new(0.5, 0, 0, -60)}, 0.3)
        task.delay(0.3, function()
            UI.NotificationFrame.Visible = false
        end)
    end)
end

function Logic.Show()
    State.IsVisible = true
    UI.ScreenGui.Enabled = true
    UI.MainFrame.Size = UDim2.new(0, 580, 0, 400)
    Tween(UI.MainFrame, {Size = UDim2.new(0, 650, 0, 450)}, 0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
    Logic.LoadPets()
end

function Logic.Hide()
    State.IsVisible = false
    Tween(UI.MainFrame, {Size = UDim2.new(0, 580, 0, 400)}, 0.2)
    task.delay(0.2, function()
        if not State.IsVisible then
            UI.ScreenGui.Enabled = false
        end
    end)
end

-- ============================================
-- INITIALIZATION
-- ============================================
UI.Build()
Logic.SetupInteractions()

-- Show the shop immediately for demo
Logic.Show()

-- Or bind to a key/button:
-- local function onInputBegan(input, gameProcessed)
--     if gameProcessed then return end
--     if input.KeyCode == Enum.KeyCode.P then Logic.Toggle() end
-- end
-- UserInputService.InputBegan:Connect(onInputBegan)

print("Pet Shop System initialized!")
