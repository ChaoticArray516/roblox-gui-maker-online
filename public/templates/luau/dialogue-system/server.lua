--[[
    Dialogue System - Server Script
    Manages dialogue trees, NPC interactions, quest states, and choice branching.
    Place in: ServerScriptService
--]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local DataStoreService = game:GetService("DataStoreService")

-- ============================================================
-- DATA STORES
-- ============================================================
local playerDialogueStore = DataStoreService:GetDataStore("Dialogue_PlayerData_v1")

-- ============================================================
-- REMOTE EVENTS SETUP
-- ============================================================
local remotesFolder = Instance.new("Folder")
remotesFolder.Name = "Dialogue_System_Remotes"
remotesFolder.Parent = ReplicatedStorage

local remoteNames = {
    "StartDialogue",
    "AdvanceDialogue",
    "SelectChoice",
    "EndDialogue",
    "RequestDialogue",
    "PortraitUpdate",
    "EmotionUpdate",
}

for _, name in ipairs(remoteNames) do
    local remote = Instance.new("RemoteEvent")
    remote.Name = name
    remote.Parent = remotesFolder
end

-- Remote references
local startDialogueRemote = remotesFolder.StartDialogue
local advanceDialogueRemote = remotesFolder.AdvanceDialogue
local selectChoiceRemote = remotesFolder.SelectChoice
local endDialogueRemote = remotesFolder.EndDialogue
local requestDialogueRemote = remotesFolder.RequestDialogue
local portraitUpdateRemote = remotesFolder.PortraitUpdate
local emotionUpdateRemote = remotesFolder.EmotionUpdate

-- ============================================================
-- DIALOGUE TREE DEFINITIONS
-- ============================================================

--[[
    Dialogue Node Format:
    {
        id = "unique_id",
        text = "Dialogue text here...",
        speaker = "NPC Name",
        portrait = "rbxassetid://...",
        emotion = "happy|sad|angry|surprised|thinking|neutral",
        choices = {
            { id = "choice_1", text = "Choice text", nextNode = "next_node_id", condition = function() return true end },
        },
        nextNode = "default_next_node_id", -- Used if no choices or auto-advance
        onEnter = function(player, session) end, -- Callback when entering this node
        onExit = function(player, session) end, -- Callback when leaving this node
    }
--]]

local DIALOGUE_TREES = {
    -- Elder Wizard quest giver
    elder_wizard = {
        startNode = "greeting",
        nodes = {
            greeting = {
                id = "greeting",
                text = "Welcome, traveler! I have been expecting you. The kingdom is in grave danger and only you can help us...",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "happy",
                choices = {
                    { id = "accept_quest", text = "I will help! Tell me more.", nextNode = "quest_details" },
                    { id = "decline", text = "I'm busy right now.", nextNode = "declined" },
                    { id = "ask_more", text = "What kind of danger?", nextNode = "danger_explain" },
                },
            },
            quest_details = {
                id = "quest_details",
                text = "Excellent! The Dark Lord has awakened in the Shadow Mountains. You must collect the three Sacred Crystals to seal him away again. The first crystal lies in the Whispering Forest...",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "thinking",
                choices = {
                    { id = "accept_crystals", text = "I'll find the crystals!", nextNode = "crystal_hint" },
                    { id = "ask_reward", text = "What's in it for me?", nextNode = "reward_talk" },
                },
            },
            danger_explain = {
                id = "danger_explain",
                text = "A dark force grows in the north. Villages have been vanishing overnight, and strange creatures roam the forests. We need a brave hero to investigate...",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "sad",
                choices = {
                    { id = "accept_after_danger", text = "I'll investigate.", nextNode = "quest_details" },
                    { id = "still_decline", text = "Sounds too dangerous.", nextNode = "declined" },
                },
            },
            declined = {
                id = "declined",
                text = "I understand. The path of a hero is not for everyone. Come back if you change your mind...",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "sad",
                nextNode = nil, -- End dialogue
            },
            crystal_hint = {
                id = "crystal_hint",
                text = "Look for the ancient tree with glowing blue roots. The first crystal is hidden beneath it. Be careful - the forest is filled with traps!",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "happy",
                choices = {
                    { id = "got_it", text = "Got it! I'm on my way.", nextNode = "farewell" },
                },
                onExit = function(player, session)
                    -- Start quest
                    session.quests.crystal_quest = {
                        status = "active",
                        stage = 1,
                        crystals_collected = 0,
                    }
                end,
            },
            reward_talk = {
                id = "reward_talk",
                text = "Ah, a practical one! You shall receive 1000 gold coins and the legendary Sword of Light upon completion. Plus, the gratitude of an entire kingdom!",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "surprised",
                choices = {
                    { id = "accept_reward", text = "Deal! Where do I start?", nextNode = "crystal_hint" },
                },
            },
            farewell = {
                id = "farewell",
                text = "May the light guide your path, brave hero. Return to me when you have found all three crystals!",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "happy",
                nextNode = nil, -- End dialogue
            },
            return_visit = {
                id = "return_visit",
                text = "You're back! Have you found any of the Sacred Crystals yet?",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "thinking",
                choices = {
                    { id = "not_yet", text = "Not yet, but I'm looking.", nextNode = "encouragement" },
                    { id = "found_one", text = "I found one!", nextNode = "crystal_turnin", condition = function(player, session)
                        return (session.quests.crystal_quest and session.quests.crystal_quest.crystals_collected > 0)
                    end },
                },
            },
            encouragement = {
                id = "encouragement",
                text = "Keep searching! The kingdom is counting on you. Remember: the ancient tree with blue roots in the Whispering Forest!",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "happy",
                nextNode = nil,
            },
            crystal_turnin = {
                id = "crystal_turnin",
                text = "Wonderful! You truly are the chosen hero. Keep collecting - we need all three to seal the Dark Lord!",
                speaker = "Elder Wizard",
                portrait = "",
                emotion = "happy",
                nextNode = nil,
            },
        },
    },

    -- Shopkeeper
    shopkeeper = {
        startNode = "shop_greeting",
        nodes = {
            shop_greeting = {
                id = "shop_greeting",
                text = "Welcome to my shop, adventurer! I've got the finest potions and equipment in all the land. What can I get for you today?",
                speaker = "Merchant Gilda",
                portrait = "",
                emotion = "happy",
                choices = {
                    { id = "buy", text = "Show me what you have.", nextNode = "browse_goods" },
                    { id = "sell", text = "I want to sell something.", nextNode = "sell_goods" },
                    { id = "chat", text = "How's business?", nextNode = "shop_chat" },
                    { id = "leave", text = "Just browsing, thanks.", nextNode = "shop_farewell" },
                },
            },
            browse_goods = {
                id = "browse_goods",
                text = "Take a look! Health Potions for 50 gold, Mana Potions for 75, and my special Elixir of Speed for 200 gold. Limited stock!",
                speaker = "Merchant Gilda",
                portrait = "",
                emotion = "happy",
                choices = {
                    { id = "buy_health", text = "Health Potion (50g)", nextNode = "purchase" },
                    { id = "buy_mana", text = "Mana Potion (75g)", nextNode = "purchase" },
                    { id = "buy_speed", text = "Elixir of Speed (200g)", nextNode = "purchase" },
                    { id = "nevermind", text = "Changed my mind.", nextNode = "shop_greeting" },
                },
            },
            sell_goods = {
                id = "sell_goods",
                text = "I'm always buying! Show me what you've got and I'll give you a fair price.",
                speaker = "Merchant Gilda",
                portrait = "",
                emotion = "thinking",
                nextNode = nil,
            },
            shop_chat = {
                id = "shop_chat",
                text = "Oh, you know how it is. Ever since those monsters started appearing, everyone's buying up potions like crazy. Good for business, terrible for sleep!",
                speaker = "Merchant Gilda",
                portrait = "",
                emotion = "surprised",
                choices = {
                    { id = "back_to_shop", text = "Let me see your goods.", nextNode = "browse_goods" },
                    { id = "leave_chat", text = "Take care!", nextNode = "shop_farewell" },
                },
            },
            purchase = {
                id = "purchase",
                text = "Pleasure doing business with you! Come back anytime you need supplies.",
                speaker = "Merchant Gilda",
                portrait = "",
                emotion = "happy",
                nextNode = nil,
            },
            shop_farewell = {
                id = "shop_farewell",
                text = "Safe travels, adventurer! My doors are always open.",
                speaker = "Merchant Gilda",
                portrait = "",
                emotion = "happy",
                nextNode = nil,
            },
        },
    },
}

-- ============================================================
-- PLAYER SESSION MANAGEMENT
-- ============================================================
local playerSessions = {}

local function createDefaultSession()
    return {
        activeDialogue = nil,
        currentTree = nil,
        currentNode = nil,
        dialogueHistory = {},
        quests = {},
        npcFlags = {},
        visitedNodes = {},
    }
end

local function loadPlayerData(player)
    local success, data = pcall(function()
        return playerDialogueStore:GetAsync("Dialogue_" .. player.UserId)
    end)
    if success and data then
        return data
    end
    return nil
end

local function savePlayerData(player, session)
    local data = {
        quests = session.quests,
        npcFlags = session.npcFlags,
        visitedNodes = session.visitedNodes,
    }
    pcall(function()
        playerDialogueStore:SetAsync("Dialogue_" .. player.UserId, data)
    end)
end

-- ============================================================
-- DIALOGUE ENGINE
-- ============================================================

local function getStartNode(treeId, session)
    local tree = DIALOGUE_TREES[treeId]
    if not tree then return nil end

    -- Check for return visit
    if treeId == "elder_wizard" and session.npcFlags.met_wizard then
        return tree.nodes.return_visit
    end

    return tree.nodes[tree.startNode]
end

local function getNode(treeId, nodeId)
    local tree = DIALOGUE_TREES[treeId]
    if not tree then return nil end
    return tree.nodes[nodeId]
end

local function evaluateConditions(choices, player, session)
    local validChoices = {}
    for _, choice in ipairs(choices) do
        if not choice.condition or choice.condition(player, session) then
            table.insert(validChoices, choice)
        end
    end
    return validChoices
end

local function sendNodeToClient(player, node, choices)
    local clientChoices = nil
    if choices and #choices > 0 then
        clientChoices = {}
        for _, c in ipairs(choices) do
            table.insert(clientChoices, {
                id = c.id,
                text = c.text,
            })
        end
    end

    startDialogueRemote:FireClient(player, {
        speaker = node.speaker,
        text = node.text,
        portrait = node.portrait,
        emotion = node.emotion,
        choices = clientChoices,
    })
end

local function advanceToNode(player, nodeId)
    local session = playerSessions[player]
    if not session then return end

    local tree = DIALOGUE_TREES[session.currentTree]
    if not tree then return end

    local node = tree.nodes[nodeId]
    if not node then
        -- End dialogue if node not found
        endDialogueRemote:FireClient(player)
        session.activeDialogue = false
        session.currentTree = nil
        session.currentNode = nil
        return
    end

    -- Run onExit of previous node
    if session.currentNode then
        local prevNode = tree.nodes[session.currentNode]
        if prevNode and prevNode.onExit then
            prevNode.onExit(player, session)
        end
    end

    -- Run onEnter of new node
    if node.onEnter then
        node.onEnter(player, session)
    end

    session.currentNode = nodeId
    session.visitedNodes[nodeId] = true

    -- Evaluate choice conditions
    local validChoices = nil
    if node.choices then
        validChoices = evaluateConditions(node.choices, player, session)
    end

    -- Send to client
    advanceDialogueRemote:FireClient(player, {
        speaker = node.speaker,
        text = node.text,
        portrait = node.portrait,
        emotion = node.emotion,
        choices = validChoices,
    })

    -- Auto-advance if no choices and nextNode is set
    if (not validChoices or #validChoices == 0) and node.nextNode then
        task.delay(0.5 + #node.text * 0.04, function()
            if session.currentNode == nodeId then
                advanceToNode(player, node.nextNode)
            end
        end)
    end
end

-- ============================================================
-- EVENT CONNECTIONS
-- ============================================================

Players.PlayerAdded:Connect(function(player)
    local savedData = loadPlayerData(player)
    local session = createDefaultSession()

    if savedData then
        session.quests = savedData.quests or {}
        session.npcFlags = savedData.npcFlags or {}
        session.visitedNodes = savedData.visitedNodes or {}
    end

    playerSessions[player] = session
end)

Players.PlayerRemoving:Connect(function(player)
    local session = playerSessions[player]
    if session then
        savePlayerData(player, session)
        playerSessions[player] = nil
    end
end)

-- Request dialogue start (from NPC proximity prompt)
requestDialogueRemote.OnServerEvent:Connect(function(player, treeId)
    local session = playerSessions[player]
    if not session then return end
    if session.activeDialogue then return end

    local tree = DIALOGUE_TREES[treeId]
    if not tree then
        warn("[Dialogue System] Unknown dialogue tree: " .. tostring(treeId))
        return
    end

    session.activeDialogue = true
    session.currentTree = treeId

    local startNode = getStartNode(treeId, session)
    if not startNode then return end

    -- Mark NPC as met
    if treeId == "elder_wizard" then
        session.npcFlags.met_wizard = true
    end

    session.currentNode = startNode.id
    session.visitedNodes[startNode.id] = true

    local validChoices = nil
    if startNode.choices then
        validChoices = evaluateConditions(startNode.choices, player, session)
    end

    sendNodeToClient(player, startNode, validChoices)
end)

-- Advance dialogue
advanceDialogueRemote.OnServerEvent:Connect(function(player)
    local session = playerSessions[player]
    if not session or not session.activeDialogue then return end

    local tree = DIALOGUE_TREES[session.currentTree]
    if not tree then return end

    local currentNode = tree.nodes[session.currentNode]
    if not currentNode then return end

    -- If there are choices, don't auto-advance
    if currentNode.choices and #evaluateConditions(currentNode.choices, player, session) > 0 then
        return
    end

    -- Auto-advance
    if currentNode.nextNode then
        advanceToNode(player, currentNode.nextNode)
    else
        -- End dialogue
        endDialogueRemote:FireClient(player)
        session.activeDialogue = false
        session.currentTree = nil
        session.currentNode = nil
    end
end)

-- Select choice
selectChoiceRemote.OnServerEvent:Connect(function(player, choiceId)
    local session = playerSessions[player]
    if not session or not session.activeDialogue then return end

    local tree = DIALOGUE_TREES[session.currentTree]
    if not tree then return end

    local currentNode = tree.nodes[session.currentNode]
    if not currentNode or not currentNode.choices then return end

    -- Find the selected choice
    for _, choice in ipairs(currentNode.choices) do
        if choice.id == choiceId then
            if choice.nextNode then
                advanceToNode(player, choice.nextNode)
            else
                -- End if no next node
                endDialogueRemote:FireClient(player)
                session.activeDialogue = false
                session.currentTree = nil
                session.currentNode = nil
            end
            return
        end
    end
end)

-- End dialogue
endDialogueRemote.OnServerEvent:Connect(function(player)
    local session = playerSessions[player]
    if not session then return end

    session.activeDialogue = false
    session.currentTree = nil
    session.currentNode = nil
    savePlayerData(player, session)
end)

-- ============================================================
-- SHUTDOWN HANDLER
-- ============================================================

game:BindToClose(function()
    for player, session in pairs(playerSessions) do
        pcall(function()
            savePlayerData(player, session)
        end)
    end
end)

print("[Dialogue System Server] Initialized successfully")
