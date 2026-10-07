--[[
    Settings Menu - Server Side
    Handles persistent settings storage via DataStore
    Features: Save/load player settings, validation, default fallbacks
]]

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- DataStore for settings
local SettingsStore = DataStoreService:GetDataStore("PlayerSettings_v1")

-- Configuration
local MAX_SETTINGS_SIZE = 10000 -- bytes
local SAVE_COOLDOWN = 5 -- seconds

-- Player data cache
local playerSettingsCache = {}
local lastSaveTime = {}

-- Remote Events
local SettingsEvents = Instance.new("Folder")
SettingsEvents.Name = "SettingsEvents"
SettingsEvents.Parent = ReplicatedStorage

local SaveSettingsRemote = Instance.new("RemoteEvent")
SaveSettingsRemote.Name = "SaveSettings"
SaveSettingsRemote.Parent = SettingsEvents

local LoadSettingsRemote = Instance.new("RemoteFunction")
LoadSettingsRemote.Name = "LoadSettings"
LoadSettingsRemote.Parent = SettingsEvents

-- Valid settings keys and types
local VALID_SETTINGS = {
    VolumeMaster = "number",
    VolumeMusic = "number",
    VolumeSFX = "number",
    VolumeVoice = "number",
    Fullscreen = "boolean",
    ShowFPS = "boolean",
    GraphicsQuality = "number",
    Language = "string",
    Difficulty = "string",
    ShowTutorial = "boolean",
    TextSize = "number",
    ColorblindMode = "string",
    ReduceMotion = "boolean",
}

-- Valid option values
local VALID_OPTIONS = {
    Language = { English = true, Spanish = true, French = true, German = true, Japanese = true, Korean = true, Chinese = true },
    Difficulty = { Easy = true, Normal = true, Hard = true, Expert = true },
    ColorblindMode = { None = true, Deuteranopia = true, Protanopia = true, Tritanopia = true },
}

-----------------------------------------------------------
-- Validation
-----------------------------------------------------------

local function ValidateSettings(settings)
    local validated = {}
    for key, value in pairs(settings) do
        local expectedType = VALID_SETTINGS[key]
        if expectedType and type(value) == expectedType then
            -- Validate option values
            if VALID_OPTIONS[key] and not VALID_OPTIONS[key][value] then
                -- Invalid option, skip
            else
                -- Clamp numeric values
                if expectedType == "number" then
                    if key:find("^Volume") then
                        value = math.clamp(value, 0, 100)
                    elseif key == "GraphicsQuality" then
                        value = math.clamp(math.floor(value), 1, 10)
                    elseif key == "TextSize" then
                        value = math.clamp(value, 50, 150)
                    end
                end
                validated[key] = value
            end
        end
    end
    return validated
end

-----------------------------------------------------------
-- DataStore Operations
-----------------------------------------------------------

local function SavePlayerSettings(player, settings)
    local userId = tostring(player.UserId)

    -- Rate limiting
    local lastSave = lastSaveTime[userId]
    if lastSave and (os.time() - lastSave) < SAVE_COOLDOWN then
        return false, "Save cooldown active"
    end

    -- Validate
    local validated = ValidateSettings(settings)

    -- Save to DataStore
    local success, err = pcall(function()
        SettingsStore:SetAsync(userId, validated)
    end)

    if success then
        playerSettingsCache[userId] = validated
        lastSaveTime[userId] = os.time()
        return true, "Settings saved"
    else
        warn("[Settings] Failed to save settings for " .. player.Name .. ": " .. tostring(err))
        return false, "DataStore error"
    end
end

local function LoadPlayerSettings(player)
    local userId = tostring(player.UserId)

    -- Check cache
    if playerSettingsCache[userId] then
        return playerSettingsCache[userId]
    end

    -- Load from DataStore
    local success, settings = pcall(function()
        return SettingsStore:GetAsync(userId)
    end)

    if success and settings then
        local validated = ValidateSettings(settings)
        playerSettingsCache[userId] = validated
        return validated
    end

    -- Return nil to use client defaults
    return nil
end

-----------------------------------------------------------
-- Event Handlers
-----------------------------------------------------------

SaveSettingsRemote.OnServerEvent:Connect(function(player, settings)
    if type(settings) ~= "table" then return end

    local success, message = SavePlayerSettings(player, settings)
    if success then
        print("[Settings] Saved settings for " .. player.Name)
    else
        warn("[Settings] Save failed: " .. message)
    end
end)

LoadSettingsRemote.OnServerInvoke = function(player)
    return LoadPlayerSettings(player)
end

-----------------------------------------------------------
-- Player Management
-----------------------------------------------------------

Players.PlayerRemoving:Connect(function(player)
    local userId = tostring(player.UserId)
    playerSettingsCache[userId] = nil
    lastSaveTime[userId] = nil
end)

print("[Settings] Server initialized.")
