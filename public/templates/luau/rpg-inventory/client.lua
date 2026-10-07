--[[
    RPG Inventory System - Client
    Features: Drag-and-drop, equip slots, rarity colors, tooltips
    Place in: StarterPlayer > StarterPlayerScripts
--]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Remote Events (create these in ReplicatedStorage)
local Remotes = ReplicatedStorage:WaitForChild("InventoryRemotes")
local RequestInventory = Remotes:WaitForChild("RequestInventory")
local EquipItem = Remotes:WaitForChild("EquipItem")
local UnequipItem = Remotes:WaitForChild("UnequipItem")
local UseItem = Remotes:WaitForChild("UseItem")
local DropItem = Remotes:WaitForChild("DropItem")
local DestroyItem = Remotes:WaitForChild("DestroyItem")

-- ============================================
-- CONFIGURATION
-- ============================================
local CONFIG = {
    InventoryRows = 5,
    InventoryCols = 8,
    SlotSize = 64,
    SlotPadding = 8,
    AnimSpeed = 0.25,
    DoubleClickThreshold = 0.3,
    DragThreshold = 5,
}

local RARITY_COLORS = {
    Common = Color3.fromRGB(169, 169, 169),    -- Gray
    Uncommon = Color3.fromRGB(30, 180, 30),    -- Green
    Rare = Color3.fromRGB(30, 100, 220),       -- Blue
    Epic = Color3.fromRGB(148, 30, 180),       -- Purple
    Legendary = Color3.fromRGB(220, 150, 30),  -- Orange
    Mythic = Color3.fromRGB(220, 50, 50),      -- Red
}

local RARITY_GLOWS = {
    Common = 0,
    Uncommon = 2,
    Rare = 3,
    Epic = 4,
    Legendary = 5,
    Mythic = 6,
}

local EQUIPMENT_SLOTS = {
    Helmet = {Position = UDim2.new(0.5, -32, 0, 10), Label = "Helmet"},
    Armor = {Position = UDim2.new(0.5, -32, 0, 90), Label = "Armor"},
    Weapon = {Position = UDim2.new(0.5, -32, 0, 170), Label = "Weapon"},
    Boots = {Position = UDim2.new(0.5, -32, 0, 250), Label = "Boots"},
}

-- ============================================
-- STATE MANAGEMENT
-- ============================================
local State = {
    Inventory = {},        -- Array of item data or nil
    Equipped = {},         -- Map of slotType -> itemData
    IsVisible = false,
    Dragging = nil,        -- {SlotIndex, ItemData, Ghost}
    HoverSlot = nil,
    LastClickTime = 0,
    LastClickedSlot = nil,
    TooltipVisible = false,
    ActionMenuVisible = false,
}

-- ============================================
-- UTILITY FUNCTIONS
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
    if num >= 1000000 then
        return string.format("%.1fM", num / 1000000)
    elseif num >= 1000 then
        return string.format("%.1fK", num / 1000)
    else
        return tostring(num)
    end
end

local function GetRarityColor(rarity)
    return RARITY_COLORS[rarity] or RARITY_COLORS.Common
end

-- ============================================
-- UI CONSTRUCTION
-- ============================================
local UI = {}

function UI.Build()
    -- ScreenGui
    local screenGui = Create("ScreenGui", {
        Name = "RPGInventoryGui",
        Parent = playerGui,
        ResetOnSpawn = false,
        ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
        Enabled = false,
    })
    UI.ScreenGui = screenGui

    -- Main Frame
    local mainFrame = Create("Frame", {
        Name = "MainFrame",
        Parent = screenGui,
        AnchorPoint = Vector2.new(0.5, 0.5),
        Position = UDim2.new(0.5, 0, 0.5, 0),
        Size = UDim2.new(0, 700, 0, 500),
        BackgroundColor3 = Color3.fromRGB(25, 25, 35),
        BorderSizePixel = 0,
        ClipsDescendants = true,
        ZIndex = 10,
    })
    UI.MainFrame = mainFrame

    -- Corner
    Create("UICorner", {
        CornerRadius = UDim.new(0, 12),
        Parent = mainFrame,
    })

    -- Gradient Background
    Create("UIGradient", {
        Color = ColorSequence.new({
            ColorSequenceKeypoint.new(0, Color3.fromRGB(30, 30, 45)),
            ColorSequenceKeypoint.new(1, Color3.fromRGB(18, 18, 28)),
        }),
        Rotation = 135,
        Parent = mainFrame,
    })

    -- Top Bar
    local topBar = Create("Frame", {
        Name = "TopBar",
        Parent = mainFrame,
        Size = UDim2.new(1, 0, 0, 50),
        BackgroundColor3 = Color3.fromRGB(35, 35, 50),
        BorderSizePixel = 0,
        ZIndex = 11,
    })

    Create("UICorner", {
        CornerRadius = UDim.new(0, 0),
        Parent = topBar,
    })

    -- Title
    Create("TextLabel", {
        Name = "TitleLabel",
        Parent = topBar,
        Position = UDim2.new(0, 15, 0, 0),
        Size = UDim2.new(0, 200, 1, 0),
        BackgroundTransparency = 1,
        Text = "INVENTORY",
        TextColor3 = Color3.fromRGB(220, 220, 240),
        TextSize = 22,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 12,
    })

    -- Coin Balance
    UI.CoinBalance = Create("TextLabel", {
        Name = "CoinBalance",
        Parent = topBar,
        Position = UDim2.new(1, -180, 0, 10),
        Size = UDim2.new(0, 130, 0, 30),
        BackgroundColor3 = Color3.fromRGB(45, 35, 25),
        Text = "Coins: 1,250",
        TextColor3 = Color3.fromRGB(255, 200, 50),
        TextSize = 16,
        Font = Enum.Font.GothamSemibold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 6), Parent = UI.CoinBalance})

    -- Close Button
    local closeButton = Create("TextButton", {
        Name = "CloseButton",
        Parent = topBar,
        Position = UDim2.new(1, -45, 0, 8),
        Size = UDim2.new(0, 34, 0, 34),
        BackgroundColor3 = Color3.fromRGB(180, 50, 50),
        Text = "X",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 18,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = closeButton})

    -- Equipment Panel (Left Side)
    local equipPanel = Create("Frame", {
        Name = "EquipmentPanel",
        Parent = mainFrame,
        Position = UDim2.new(0, 0, 0, 50),
        Size = UDim2.new(0, 210, 1, -100),
        BackgroundColor3 = Color3.fromRGB(30, 30, 42),
        BorderSizePixel = 0,
        ZIndex = 11,
    })

    Create("TextLabel", {
        Name = "EquipmentTitle",
        Parent = equipPanel,
        Position = UDim2.new(0, 0, 0, 5),
        Size = UDim2.new(1, 0, 0, 30),
        BackgroundTransparency = 1,
        Text = "EQUIPPED",
        TextColor3 = Color3.fromRGB(180, 180, 200),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })

    -- Equipment Slots
    UI.EquipSlots = {}
    for slotType, slotConfig in pairs(EQUIPMENT_SLOTS) do
        local slotFrame = Create("Frame", {
            Name = slotType .. "Slot",
            Parent = equipPanel,
            Position = slotConfig.Position,
            Size = UDim2.new(0, 64, 0, 64),
            BackgroundColor3 = Color3.fromRGB(40, 40, 55),
            BorderSizePixel = 0,
            ZIndex = 12,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = slotFrame})
        local stroke = Create("UIStroke", {
            Color = Color3.fromRGB(80, 80, 100),
            Thickness = 2,
            Parent = slotFrame,
        })
        Create("ImageLabel", {
            Name = "ItemIcon",
            Parent = slotFrame,
            Size = UDim2.new(1, -8, 1, -8),
            Position = UDim2.new(0, 4, 0, 4),
            BackgroundTransparency = 1,
            Image = "",
            ZIndex = 13,
        })
        Create("TextLabel", {
            Name = "SlotLabel",
            Parent = slotFrame,
            Size = UDim2.new(1, 0, 0, 20),
            Position = UDim2.new(0, 0, 1, 2),
            BackgroundTransparency = 1,
            Text = slotConfig.Label,
            TextColor3 = Color3.fromRGB(120, 120, 140),
            TextSize = 12,
            Font = Enum.Font.Gotham,
            ZIndex = 13,
        })
        UI.EquipSlots[slotType] = {Frame = slotFrame, Stroke = stroke, Icon = slotFrame.ItemIcon}
    end

    -- Inventory Grid (Right Side)
    local inventoryPanel = Create("Frame", {
        Name = "InventoryPanel",
        Parent = mainFrame,
        Position = UDim2.new(0, 215, 0, 55),
        Size = UDim2.new(1, -225, 1, -110),
        BackgroundColor3 = Color3.fromRGB(28, 28, 40),
        BorderSizePixel = 0,
        ZIndex = 11,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = inventoryPanel})

    local scrollFrame = Create("ScrollingFrame", {
        Name = "InventoryGrid",
        Parent = inventoryPanel,
        Size = UDim2.new(1, -10, 1, -10),
        Position = UDim2.new(0, 5, 0, 5),
        BackgroundTransparency = 1,
        ScrollBarThickness = 6,
        ScrollBarImageColor3 = Color3.fromRGB(80, 80, 100),
        CanvasSize = UDim2.new(0, 0, 0, 0),
        ZIndex = 12,
    })

    Create("UIGridLayout", {
        CellSize = UDim2.new(0, CONFIG.SlotSize, 0, CONFIG.SlotSize),
        CellPadding = UDim2.new(0, CONFIG.SlotPadding, 0, CONFIG.SlotPadding),
        SortOrder = Enum.SortOrder.Name,
        Parent = scrollFrame,
    })

    UI.InventorySlots = {}
    local totalSlots = CONFIG.InventoryRows * CONFIG.InventoryCols
    for i = 1, totalSlots do
        local slotFrame = Create("Frame", {
            Name = "Slot_" .. string.format("%02d", i),
            Parent = scrollFrame,
            Size = UDim2.new(0, CONFIG.SlotSize, 0, CONFIG.SlotSize),
            BackgroundColor3 = Color3.fromRGB(38, 38, 52),
            BorderSizePixel = 0,
            ZIndex = 13,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = slotFrame})
        local stroke = Create("UIStroke", {
            Color = Color3.fromRGB(70, 70, 90),
            Thickness = 1,
            Parent = slotFrame,
        })
        local icon = Create("ImageLabel", {
            Name = "ItemIcon",
            Parent = slotFrame,
            Size = UDim2.new(1, -8, 1, -8),
            Position = UDim2.new(0, 4, 0, 4),
            BackgroundTransparency = 1,
            Image = "",
            ZIndex = 14,
        })
        local qty = Create("TextLabel", {
            Name = "QuantityLabel",
            Parent = slotFrame,
            Size = UDim2.new(0, 24, 0, 18),
            Position = UDim2.new(1, -26, 1, -20),
            BackgroundColor3 = Color3.fromRGB(0, 0, 0),
            BackgroundTransparency = 0.5,
            Text = "",
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextSize = 12,
            Font = Enum.Font.GothamBold,
            ZIndex = 15,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 4), Parent = qty})

        UI.InventorySlots[i] = {
            Frame = slotFrame,
            Stroke = stroke,
            Icon = icon,
            Quantity = qty,
        }
    end

    -- Bottom Bar with Play, Settings, Store buttons
    local bottomBar = Create("Frame", {
        Name = "BottomBar",
        Parent = mainFrame,
        Position = UDim2.new(0, 0, 1, -50),
        Size = UDim2.new(1, 0, 0, 50),
        BackgroundColor3 = Color3.fromRGB(35, 35, 50),
        BorderSizePixel = 0,
        ZIndex = 11,
    })

    local bottomLayout = Create("UIListLayout", {
        FillDirection = Enum.FillDirection.Horizontal,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        VerticalAlignment = Enum.VerticalAlignment.Center,
        Padding = UDim.new(0, 12),
        Parent = bottomBar,
    })

    -- Play Button
    UI.PlayButton = Create("TextButton", {
        Name = "PlayButton",
        Parent = bottomBar,
        Size = UDim2.new(0, 100, 0, 36),
        BackgroundColor3 = Color3.fromRGB(40, 160, 60),
        Text = "Play",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = UI.PlayButton})

    -- Settings Button
    UI.SettingsButton = Create("TextButton", {
        Name = "SettingsButton",
        Parent = bottomBar,
        Size = UDim2.new(0, 100, 0, 36),
        BackgroundColor3 = Color3.fromRGB(80, 80, 120),
        Text = "Settings",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = UI.SettingsButton})

    -- Store Button
    UI.StoreButton = Create("TextButton", {
        Name = "StoreButton",
        Parent = bottomBar,
        Size = UDim2.new(0, 100, 0, 36),
        BackgroundColor3 = Color3.fromRGB(200, 140, 40),
        Text = "Store",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        ZIndex = 12,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = UI.StoreButton})

    -- Tooltip Frame
    UI.TooltipFrame = Create("Frame", {
        Name = "TooltipFrame",
        Parent = screenGui,
        Size = UDim2.new(0, 220, 0, 130),
        BackgroundColor3 = Color3.fromRGB(35, 35, 50),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 100,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = UI.TooltipFrame})
    UI.TooltipStroke = Create("UIStroke", {
        Color = Color3.fromRGB(100, 100, 120),
        Thickness = 2,
        Parent = UI.TooltipFrame,
    })
    UI.TooltipName = Create("TextLabel", {
        Name = "ItemName",
        Parent = UI.TooltipFrame,
        Position = UDim2.new(0, 10, 0, 8),
        Size = UDim2.new(1, -20, 0, 24),
        BackgroundTransparency = 1,
        Text = "Item Name",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 16,
        Font = Enum.Font.GothamBold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 101,
    })
    UI.TooltipRarity = Create("TextLabel", {
        Name = "ItemRarity",
        Parent = UI.TooltipFrame,
        Position = UDim2.new(0, 10, 0, 34),
        Size = UDim2.new(1, -20, 0, 18),
        BackgroundTransparency = 1,
        Text = "Common",
        TextColor3 = Color3.fromRGB(169, 169, 169),
        TextSize = 13,
        Font = Enum.Font.GothamSemibold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 101,
    })
    UI.TooltipDesc = Create("TextLabel", {
        Name = "ItemDescription",
        Parent = UI.TooltipFrame,
        Position = UDim2.new(0, 10, 0, 56),
        Size = UDim2.new(1, -20, 0, 40),
        BackgroundTransparency = 1,
        Text = "Item description goes here.",
        TextColor3 = Color3.fromRGB(180, 180, 200),
        TextSize = 12,
        Font = Enum.Font.Gotham,
        TextXAlignment = Enum.TextXAlignment.Left,
        TextWrapped = true,
        ZIndex = 101,
    })
    UI.TooltipStats = Create("TextLabel", {
        Name = "ItemStats",
        Parent = UI.TooltipFrame,
        Position = UDim2.new(0, 10, 0, 100),
        Size = UDim2.new(1, -20, 0, 22),
        BackgroundTransparency = 1,
        Text = "ATK: +10 | DEF: +5",
        TextColor3 = Color3.fromRGB(100, 220, 100),
        TextSize = 12,
        Font = Enum.Font.GothamSemibold,
        TextXAlignment = Enum.TextXAlignment.Left,
        ZIndex = 101,
    })

    -- Drag Ghost
    UI.DragGhost = Create("Frame", {
        Name = "DragGhost",
        Parent = screenGui,
        Size = UDim2.new(0, CONFIG.SlotSize, 0, CONFIG.SlotSize),
        BackgroundColor3 = Color3.fromRGB(50, 50, 70),
        BackgroundTransparency = 0.3,
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 200,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = UI.DragGhost})
    UI.DragGhostIcon = Create("ImageLabel", {
        Name = "ItemIcon",
        Parent = UI.DragGhost,
        Size = UDim2.new(1, -8, 1, -8),
        Position = UDim2.new(0, 4, 0, 4),
        BackgroundTransparency = 1,
        Image = "",
        ZIndex = 201,
    })
    UI.DragGhostQty = Create("TextLabel", {
        Name = "QuantityLabel",
        Parent = UI.DragGhost,
        Size = UDim2.new(0, 24, 0, 18),
        Position = UDim2.new(1, -26, 1, -20),
        BackgroundColor3 = Color3.fromRGB(0, 0, 0),
        BackgroundTransparency = 0.5,
        Text = "",
        TextColor3 = Color3.fromRGB(255, 255, 255),
        TextSize = 12,
        Font = Enum.Font.GothamBold,
        ZIndex = 202,
    })

    -- Action Menu (Right-click context menu)
    UI.ActionMenu = Create("Frame", {
        Name = "ActionMenu",
        Parent = screenGui,
        Size = UDim2.new(0, 130, 0, 140),
        BackgroundColor3 = Color3.fromRGB(40, 40, 55),
        BorderSizePixel = 0,
        Visible = false,
        ZIndex = 300,
    })
    Create("UICorner", {CornerRadius = UDim.new(0, 8), Parent = UI.ActionMenu})
    Create("UIListLayout", {
        Padding = UDim.new(0, 2),
        Parent = UI.ActionMenu,
    })

    local actions = {"Use", "Equip", "Drop", "Destroy"}
    local actionColors = {
        Use = Color3.fromRGB(50, 130, 60),
        Equip = Color3.fromRGB(50, 90, 150),
        Drop = Color3.fromRGB(140, 120, 40),
        Destroy = Color3.fromRGB(160, 50, 50),
    }
    UI.ActionButtons = {}
    for _, action in ipairs(actions) do
        local btn = Create("TextButton", {
            Name = action .. "Button",
            Parent = UI.ActionMenu,
            Size = UDim2.new(1, -8, 0, 30),
            Position = UDim2.new(0, 4, 0, 0),
            BackgroundColor3 = actionColors[action],
            Text = action,
            TextColor3 = Color3.fromRGB(255, 255, 255),
            TextSize = 14,
            Font = Enum.Font.GothamSemibold,
            ZIndex = 301,
        })
        Create("UICorner", {CornerRadius = UDim.new(0, 6), Parent = btn})
        UI.ActionButtons[action] = btn
    end

    return UI
end

-- ============================================
-- DRAG AND DROP SYSTEM
-- ============================================
function UI.SetupDragAndDrop()
    local dragStartPos = nil
    local dragStartScreenPos = nil
    local dragSlotIndex = nil

    for i, slot in ipairs(UI.InventorySlots) do
        slot.Frame.InputBegan:Connect(function(input)
            if input.UserInputType ~= Enum.UserInputType.MouseButton1 and
               input.UserInputType ~= Enum.UserInputType.Touch then
                return
            end

            local item = State.Inventory[i]
            if not item then return end

            dragStartPos = input.Position
            dragStartScreenPos = input.Position
            dragSlotIndex = i

            -- Check for double click
            local now = tick()
            if State.LastClickedSlot == i and
               (now - State.LastClickTime) < CONFIG.DoubleClickThreshold then
                -- Double click - use item
                Logic.UseItem(i)
                dragSlotIndex = nil
                return
            end
            State.LastClickTime = now
            State.LastClickedSlot = i
        end)

        slot.Frame.InputChanged:Connect(function(input)
            if input.UserInputType ~= Enum.UserInputType.MouseMovement and
               input.UserInputType ~= Enum.UserInputType.Touch then
                return
            end
            if not dragStartPos or not dragSlotIndex then return end

            local delta = (input.Position - dragStartPos).Magnitude
            if delta > CONFIG.DragThreshold then
                -- Start dragging
                if not State.Dragging then
                    Logic.StartDrag(dragSlotIndex)
                end
                -- Update ghost position
                UI.DragGhost.Position = UDim2.new(0, input.Position.X - CONFIG.SlotSize/2,
                                                   0, input.Position.Y - CONFIG.SlotSize/2)
            end

            -- Tooltip
            Logic.ShowTooltip(i, input.Position)
        end)

        slot.Frame.InputEnded:Connect(function(input)
            if input.UserInputType ~= Enum.UserInputType.MouseButton1 and
               input.UserInputType ~= Enum.UserInputType.Touch then
                return
            end
            if State.Dragging then
                Logic.EndDrag()
            end
            dragStartPos = nil
            dragSlotIndex = nil
        end)
    end

    -- Global input ended for drag cleanup
    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 and State.Dragging then
            Logic.EndDrag()
            dragStartPos = nil
            dragSlotIndex = nil
        end
    end)
end

-- ============================================
-- LOGIC SYSTEM
-- ============================================
local Logic = {}

function Logic.StartDrag(slotIndex)
    local item = State.Inventory[slotIndex]
    if not item then return end

    State.Dragging = {
        SlotIndex = slotIndex,
        ItemData = item,
    }

    UI.DragGhostIcon.Image = item.Icon or ""
    UI.DragGhostQty.Text = item.Quantity and item.Quantity > 1 and tostring(item.Quantity) or ""
    UI.DragGhost.Visible = true

    -- Hide original icon temporarily
    local slot = UI.InventorySlots[slotIndex]
    Tween(slot.Icon, {ImageTransparency = 0.5}, 0.15)
    Tween(slot.Frame, {BackgroundTransparency = 0.5}, 0.15)
end

function Logic.EndDrag()
    if not State.Dragging then return end

    local dragSlot = State.Dragging.SlotIndex
    local mousePos = UserInputService:GetMouseLocation()

    -- Check if dropped on equipment slot
    for slotType, equipUI in pairs(UI.EquipSlots) do
        local absPos = equipUI.Frame.AbsolutePosition
        local absSize = equipUI.Frame.AbsoluteSize
        if mousePos.X >= absPos.X and mousePos.X <= absPos.X + absSize.X and
           mousePos.Y >= absPos.Y and mousePos.Y <= absPos.Y + absSize.Y then
            Logic.EquipItem(dragSlot, slotType)
            break
        end
    end

    -- Check if dropped on another inventory slot
    for i, slot in ipairs(UI.InventorySlots) do
        if i ~= dragSlot then
            local absPos = slot.Frame.AbsolutePosition
            local absSize = slot.Frame.AbsoluteSize
            if mousePos.X >= absPos.X and mousePos.X <= absPos.X + absSize.X and
               mousePos.Y >= absPos.Y and mousePos.Y <= absPos.Y + absSize.Y then
                Logic.SwapSlots(dragSlot, i)
                break
            end
        end
    end

    -- Cleanup drag
    UI.DragGhost.Visible = false
    local origSlot = UI.InventorySlots[dragSlot]
    Tween(origSlot.Icon, {ImageTransparency = 0}, 0.15)
    Tween(origSlot.Frame, {BackgroundTransparency = 0}, 0.15)

    State.Dragging = nil
end

function Logic.SwapSlots(fromIndex, toIndex)
    -- Swap local state
    State.Inventory[fromIndex], State.Inventory[toIndex] =
        State.Inventory[toIndex], State.Inventory[fromIndex]
    Logic.RefreshSlots()
end

function Logic.EquipItem(slotIndex, slotType)
    local item = State.Inventory[slotIndex]
    if not item then return end
    if item.SlotType and item.SlotType ~= slotType then
        -- Wrong slot type
        return
    end

    -- Unequip current if any
    if State.Equipped[slotType] then
        Logic.UnequipSlot(slotType)
    end

    -- Equip new item
    State.Equipped[slotType] = item
    EquipItem:FireServer(slotIndex, slotType)

    Logic.RefreshEquipSlots()
    Logic.RefreshSlots()
end

function Logic.UnequipSlot(slotType)
    State.Equipped[slotType] = nil
    UnequipItem:FireServer(slotType)
    Logic.RefreshEquipSlots()
end

function Logic.UseItem(slotIndex)
    local item = State.Inventory[slotIndex]
    if not item then return end
    if not item.Usable then return end

    UseItem:FireServer(slotIndex)
    -- Reduce quantity locally for immediate feedback
    if item.Quantity and item.Quantity > 1 then
        item.Quantity = item.Quantity - 1
    else
        State.Inventory[slotIndex] = nil
    end
    Logic.RefreshSlots()
end

function Logic.DropItem(slotIndex)
    local item = State.Inventory[slotIndex]
    if not item then return end

    DropItem:FireServer(slotIndex)
    State.Inventory[slotIndex] = nil
    Logic.RefreshSlots()
end

function Logic.DestroyItem(slotIndex)
    local item = State.Inventory[slotIndex]
    if not item then return end

    DestroyItem:FireServer(slotIndex)
    State.Inventory[slotIndex] = nil
    Logic.RefreshSlots()
end

function Logic.ShowTooltip(slotIndex, screenPos)
    local item = State.Inventory[slotIndex]
    if not item then
        UI.TooltipFrame.Visible = false
        State.TooltipVisible = false
        return
    end

    UI.TooltipName.Text = item.Name or "Unknown Item"
    UI.TooltipName.TextColor3 = GetRarityColor(item.Rarity or "Common")
    UI.TooltipRarity.Text = item.Rarity or "Common"
    UI.TooltipRarity.TextColor3 = GetRarityColor(item.Rarity or "Common")
    UI.TooltipDesc.Text = item.Description or "No description available."
    UI.TooltipStats.Text = Logic.FormatStats(item.Stats)
    UI.TooltipStroke.Color = GetRarityColor(item.Rarity or "Common")

    -- Position tooltip near mouse but keep on screen
    local x = screenPos.X + 20
    local y = screenPos.Y + 20
    local screenSize = workspace.CurrentCamera.ViewportSize
    if x + 220 > screenSize.X then x = screenPos.X - 240 end
    if y + 130 > screenSize.Y then y = screenPos.Y - 150 end

    UI.TooltipFrame.Position = UDim2.new(0, x, 0, y)
    UI.TooltipFrame.Visible = true
    State.TooltipVisible = true
end

function Logic.HideTooltip()
    UI.TooltipFrame.Visible = false
    State.TooltipVisible = false
end

function Logic.FormatStats(stats)
    if not stats then return "" end
    local parts = {}
    for stat, value in pairs(stats) do
        local sign = value >= 0 and "+" or ""
        table.insert(parts, stat .. ": " .. sign .. tostring(value))
    end
    return table.concat(parts, " | ")
end

function Logic.RefreshSlots()
    for i, slot in ipairs(UI.InventorySlots) do
        local item = State.Inventory[i]
        if item then
            slot.Icon.Image = item.Icon or ""
            slot.Quantity.Text = item.Quantity and item.Quantity > 1 and tostring(item.Quantity) or ""
            slot.Stroke.Color = GetRarityColor(item.Rarity or "Common")
            slot.Stroke.Thickness = 1 + (RARITY_GLOWS[item.Rarity] or 0) * 0.5
        else
            slot.Icon.Image = ""
            slot.Quantity.Text = ""
            slot.Stroke.Color = Color3.fromRGB(70, 70, 90)
            slot.Stroke.Thickness = 1
        end
    end
end

function Logic.RefreshEquipSlots()
    for slotType, equipUI in pairs(UI.EquipSlots) do
        local item = State.Equipped[slotType]
        if item then
            equipUI.Icon.Image = item.Icon or ""
            equipUI.Stroke.Color = GetRarityColor(item.Rarity or "Common")
            equipUI.Stroke.Thickness = 2 + (RARITY_GLOWS[item.Rarity] or 0)
        else
            equipUI.Icon.Image = ""
            equipUI.Stroke.Color = Color3.fromRGB(80, 80, 100)
            equipUI.Stroke.Thickness = 2
        end
    end
end

-- ============================================
-- INPUT HANDLING
-- ============================================
function UI.SetupInput()
    -- Toggle inventory with "I" key
    UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        if input.KeyCode == Enum.KeyCode.I then
            Logic.ToggleInventory()
        end
    end)

    -- Close button
    UI.MainFrame.TopBar.CloseButton.MouseButton1Click:Connect(function()
        Logic.HideInventory()
    end)

    -- Play button
    UI.PlayButton.MouseButton1Click:Connect(function()
        Logic.HideInventory()
        -- Resume game / close menus
    end)

    -- Settings button
    UI.SettingsButton.MouseButton1Click:Connect(function()
        -- Open settings (trigger other GUI)
        print("Settings clicked")
    end)

    -- Store button
    UI.StoreButton.MouseButton1Click:Connect(function()
        -- Open store (trigger other GUI)
        print("Store clicked")
    end)

    -- Action menu buttons
    UI.ActionButtons.Use.MouseButton1Click:Connect(function()
        if State.ActionSlot then Logic.UseItem(State.ActionSlot) end
        Logic.HideActionMenu()
    end)
    UI.ActionButtons.Equip.MouseButton1Click:Connect(function()
        if State.ActionSlot then
            local item = State.Inventory[State.ActionSlot]
            if item and item.SlotType then
                Logic.EquipItem(State.ActionSlot, item.SlotType)
            end
        end
        Logic.HideActionMenu()
    end)
    UI.ActionButtons.Drop.MouseButton1Click:Connect(function()
        if State.ActionSlot then Logic.DropItem(State.ActionSlot) end
        Logic.HideActionMenu()
    end)
    UI.ActionButtons.Destroy.MouseButton1Click:Connect(function()
        if State.ActionSlot then Logic.DestroyItem(State.ActionSlot) end
        Logic.HideActionMenu()
    end)

    -- Right-click for context menu
    UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        if input.UserInputType == Enum.UserInputType.MouseButton2 then
            -- Find which slot was right-clicked
            local mousePos = UserInputService:GetMouseLocation()
            for i, slot in ipairs(UI.InventorySlots) do
                local absPos = slot.Frame.AbsolutePosition
                local absSize = slot.Frame.AbsoluteSize
                if mousePos.X >= absPos.X and mousePos.X <= absPos.X + absSize.X and
                   mousePos.Y >= absPos.Y and mousePos.Y <= absPos.Y + absSize.Y then
                    Logic.ShowActionMenu(i, mousePos)
                    break
                end
            end
        end
    end)

    -- Close action menu on click elsewhere
    UserInputService.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            Logic.HideActionMenu()
        end
    end)

    -- Hide tooltip when mouse leaves inventory area
    UI.MainFrame.MouseLeave:Connect(function()
        Logic.HideTooltip()
    end)
end

function Logic.ShowActionMenu(slotIndex, position)
    State.ActionSlot = slotIndex
    State.ActionMenuVisible = true
    UI.ActionMenu.Position = UDim2.new(0, position.X, 0, position.Y)
    UI.ActionMenu.Visible = true
end

function Logic.HideActionMenu()
    State.ActionMenuVisible = false
    State.ActionSlot = nil
    UI.ActionMenu.Visible = false
end

function Logic.ToggleInventory()
    if State.IsVisible then
        Logic.HideInventory()
    else
        Logic.ShowInventory()
    end
end

function Logic.ShowInventory()
    State.IsVisible = true
    UI.ScreenGui.Enabled = true
    UI.MainFrame.Size = UDim2.new(0, 600, 0, 400)
    Tween(UI.MainFrame, {Size = UDim2.new(0, 700, 0, 500)}, 0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
    Logic.RefreshSlots()
    Logic.RefreshEquipSlots()
end

function Logic.HideInventory()
    State.IsVisible = false
    Tween(UI.MainFrame, {Size = UDim2.new(0, 600, 0, 400)}, 0.2)
    task.delay(0.2, function()
        if not State.IsVisible then
            UI.ScreenGui.Enabled = false
        end
    end)
end

-- ============================================
-- DATA SYNC
-- ============================================
function Logic.LoadInventory()
    local data = RequestInventory:InvokeServer()
    if data then
        State.Inventory = data.Inventory or {}
        State.Equipped = data.Equipped or {}
        Logic.RefreshSlots()
        Logic.RefreshEquipSlots()
    end
end

-- ============================================
-- DEMO DATA
-- ============================================
function Logic.LoadDemoData()
    State.Inventory = {
        [1] = {Name = "Iron Sword", Rarity = "Common", Icon = "rbxassetid://12345",
               Description = "A basic iron sword.", SlotType = "Weapon",
               Usable = false, Stats = {ATK = 15, SPD = 2}},
        [2] = {Name = "Healing Potion", Rarity = "Common", Icon = "rbxassetid://12346",
               Description = "Restores 50 HP.", Usable = true, Quantity = 5,
               Stats = {HP = 50}},
        [3] = {Name = "Dragon Armor", Rarity = "Legendary", Icon = "rbxassetid://12347",
               Description = "Forged from dragon scales.", SlotType = "Armor",
               Usable = false, Stats = {DEF = 45, HP = 100}},
        [5] = {Name = "Mystic Boots", Rarity = "Rare", Icon = "rbxassetid://12348",
               Description = "Boots infused with wind magic.", SlotType = "Boots",
               Usable = false, Stats = {SPD = 15, DEF = 8}},
        [8] = {Name = "Phoenix Feather", Rarity = "Epic", Icon = "rbxassetid://12349",
               Description = "A rare feather from a phoenix.", Usable = true, Quantity = 2,
               Stats = {HP = 200}},
        [12] = {Name = "Steel Helmet", Rarity = "Uncommon", Icon = "rbxassetid://12350",
                Description = "Reinforced steel helmet.", SlotType = "Helmet",
                Usable = false, Stats = {DEF = 12}},
    }

    State.Equipped = {
        Helmet = {Name = "Steel Helmet", Rarity = "Uncommon", Icon = "rbxassetid://12350",
                  Description = "Reinforced steel helmet.", SlotType = "Helmet",
                  Stats = {DEF = 12}},
    }

    Logic.RefreshSlots()
    Logic.RefreshEquipSlots()
end

-- ============================================
-- INITIALIZATION
-- ============================================
UI.Build()
UI.SetupDragAndDrop()
UI.SetupInput()

-- Load inventory data from server
-- Logic.LoadInventory()

-- Or load demo data for preview
Logic.LoadDemoData()

print("RPG Inventory System initialized. Press 'I' to toggle.")
