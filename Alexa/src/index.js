/**
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
 http://aws.amazon.com/apache2.0/
 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * This sample shows how to create a simple Flash Card skill. The skill
 * supports 1 player at a time, and does not support games across sessions.
 */

'use strict';

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least 4 answers, any extras will be shuffled in.
 */
var questions = [
    {
        "Can you tell me a little about yourself?": [
            ""
        ]
    },
    {
        "How did you hear about the position?": [
            ""
            
        ]
    },
    {
        "What do you know about us?": [
            ""
        ]
    },
    {
        "Why do you want to work here?": [
            ""
        ]
    },
    {
        "Why do you want this job?": [
            ""
        ]
    },
    {
        "Why should we hire you?": [
            ""
        ]
    },
    {
        "What are your greatest professional strengths?": [
            ""
        ]
    },
    {
        "What is your greatest strength/ greatest weakness?": [
            ""
        ]
    },
    {
        "What is your greatest professional achievement?": [
            ""
        ]
    },
    {
        "Tell me about a challenge or conflict you've faced at work or school, and how you dealt with it.": [
            ""
        ]
    },
    {
        "Where do you see yourself in five years?": [
            ""
        ]
    },
    {
        "What's your dream job?": [
            ""
        ]
    },
    {
        "What other companies are you interviewing with?": [
            ""
        ]
    },
    {
        "What are you looking for in a new position?": [
            ""
        ]
    },
    {
        "What type of work environment do you prefer?": [
            ""
        ]
    },
    {
        "What's your management style?": [
            ""
        ]
    },
    {
        "What's a time you exercised leadership?": [
            ""
        ]
    },
    {
        "What's a time you disagreed with a decision that was made at work?": [
            ""
        ]
    },
    {
        "How would your boss and co-workers describe you?": [
            ""
        ]
    },
    {
        "How do you deal with pressure or stressful situations?": [
            ""
        ]
    },
    {
        "What would your first 30, 60, or 90 days look like in this role?": [
            ""
        ]
    },
    {
        "What do you like to do outside of work?": [
            ""
        ]
    },
    {
        "What do you think we could do better or differently?": [
            ""
        ]
    },
    {
        "What Is Your Greatest Accomplishment?": [
            ""
        ]
    },
    {
        "How do you resolve issues in a team?": [
            ""
        ]
    },
    {
        "Have you ever worked in a customer support or client facing role?": [
            ""
        ]
    },
];
var technical_questions = [
    {
        "You have 9 marbles. They all weigh the same, except one. You don't know if that one is heavier or lighter. You have a balance scale.What would be the minimum number of weighing required to find the odd one? Explain.": [
            ""
        ]
    },
    {
        "Describe the algorithm for a depth-first graph traversal.": [
            ""
        ]
    },
    {
        "Describe polymorphism to me as if I was a 6 year old child.": [
            ""
        ]
    },
    {
        "What’s an example of a time you helped a non-technical person with a technical problem, and how did you explain it to them?": [
            ""
        ]
    },
    {
        "How do virtual functions work in C++?": [
            ""
        ]
    },
    {
        "What is the difference between final, finally, and finalize in Java?": [
            ""
        ]
    },
];


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // handle yes/no intent after the user has been prompted
    if (session.attributes && session.attributes.userPromptedToContinue) {
        delete session.attributes.userPromptedToContinue;
        if ("AMAZON.NoIntent" === intentName) {
            handleFinishSessionRequest(intent, session, callback);
        } else if ("AMAZON.YesIntent" === intentName) {
            handleRepeatRequest(intent, session, callback);
        }
    }

    // dispatch custom intents to handlers here
    if ("AnswerIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AnswerOnlyIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("DoneIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("NotDoneIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        handleAnswerRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("GeneralQuestionIntent" === intentName) {
        handleGeneralQuestionRequest(intent, session, callback);
    } else if ("TechnicalQuestionIntent" === intentName) {
        handleTechnicalQuestionRequest(intent, session, callback);
    }
}

/*function done(intent, session, callback){
    var speechOutput = "And?";
    callback(session.attributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
}

function continu(intent, session, callback){
    var speechOutput = "Please continue.";
    callback(session.attributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
}*/

function handleGeneralQuestionRequest(intent, session, callback){
    var sessionAttributes = {},
        //CHANGE THIS TEXT
        speechOutput = "",
        shouldEndSession = false,

        gameQuestions = [];
    var rand = Math.floor(Math.random() * questions.length);
    gameQuestions.push(rand);

    var correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT)), // Generate a random index for the correct answer, from 0 to 3
        roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex),

        currentQuestionIndex = 0,
        spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]]),
        repromptText = spokenQuestion,

        i, j;

    for (i = 0; i < ANSWER_COUNT; i++) {
        repromptText += "";
    }
    speechOutput += repromptText;
    sessionAttributes = {
        "speechOutput": repromptText,
        "repromptText": repromptText,
        "currentQuestionIndex": currentQuestionIndex,
        "questions": gameQuestions,
            };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, true));
}

function handleTechnicalQuestionRequest(intent, session, callback){
    var sessionAttributes = {},
        //CHANGE THIS TEXT
        speechOutput = "",
        shouldEndSession = false,

        gameQuestions = [];
        rand = Math.floor(Math.random() * technical_questions.length);
    gameQuestions.push(rand);

    var correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT)), // Generate a random index for the correct answer, from 0 to 3
        roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex),

        currentQuestionIndex = 0,
        spokenQuestion = Object.keys(technical_questions[gameQuestions[currentQuestionIndex]]),
        repromptText = spokenQuestion,

        i, j;

    for (i = 0; i < ANSWER_COUNT; i++) {
        repromptText += "";
    }
    speechOutput += repromptText;
    sessionAttributes = {
        "speechOutput": repromptText,
        "repromptText": repromptText,
        "currentQuestionIndex": currentQuestionIndex,
        "questions": gameQuestions,
            };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, true));
    
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

// ------- Skill specific business logic -------

var ANSWER_COUNT = 1;
var GAME_LENGTH = 5;
// Be sure to change this for your skill.
var CARD_TITLE = "Interview Assistant"; 

function getWelcomeResponse(callback) {
    // Be sure to change this for your skill.
    var sessionAttributes = {},
        //CHANGE THIS TEXT
        speechOutput = "I will ask you " + GAME_LENGTH.toString()
            + " questions, try to answer as many as you can. Let's begin. ",
        shouldEndSession = false,

        gameQuestions = populateGameQuestions(),
        correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT)), // Generate a random index for the correct answer, from 0 to 3
        roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex),

        currentQuestionIndex = 0,
        spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]]),
        repromptText = spokenQuestion,

        i, j;

    for (i = 0; i < ANSWER_COUNT; i++) {
        repromptText += "";
    }
    speechOutput += repromptText;
    sessionAttributes = {
        "speechOutput": repromptText,
        "repromptText": repromptText,
        "currentQuestionIndex": currentQuestionIndex,
        "questions": gameQuestions,
            };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function populateGameQuestions() {
    var gameQuestions = [];
    var indexList = [];
    var techindexList = [];
    var index = questions.length;
    var technical_index = technical_questions.length;

    if (GAME_LENGTH > index){
        throw "Invalid Game Length.";
    }

    gameQuestions.push(0);

    for (var i = 0; i < questions.length; i++){
        indexList.push(i);
    }

    for (i = 0; i < technical_questions.length; i++){
        techindexList.push(i);
    }


    for (i = 1; i < Math.ceil(GAME_LENGTH/2); i++){
    //    gameQuestions.push(i);
        var rand = Math.floor(Math.random() * index);
        while (rand == 0)
            rand = Math.floor(Math.random() * index);
        index -= 1;

        var temp = indexList[index];
        indexList[index] = indexList[rand];
        indexList[rand] = temp;
        gameQuestions.push(indexList[index]);
    }

    for (i = Math.ceil(GAME_LENGTH/2); i < GAME_LENGTH; i++){
    //    gameQuestions.push(i);

        var rand = Math.floor(Math.random() * technical_index);
        technical_index -= 1;

        var temp = techindexList[technical_index];
        techindexList[technical_index] = techindexList[rand];
        techindexList[rand] = temp;
        gameQuestions.push(techindexList[technical_index]);
    }

    // Pick GAME_LENGTH random questions from the list to ask the user, make sure there are no repeats.
/*    for (var j = 0; j < GAME_LENGTH; j++){
        var rand = Math.floor(Math.random() * index);
        index -= 1;

        var temp = indexList[index];
        indexList[index] = indexList[rand];
        indexList[rand] = temp;
        gameQuestions.push(indexList[index]);
    }*/

    return gameQuestions;
}


function populateRoundAnswers(gameQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation) {
    // Get the answers for a given question, and place the correct answer at the spot marked by the
    // correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
    // only ANSWER_COUNT will be selected.
    var answers = [],
        answersCopy = questions[gameQuestionIndexes[correctAnswerIndex]][Object.keys(questions[gameQuestionIndexes[correctAnswerIndex]])[0]],
        temp, i;

    var index = answersCopy.length;

    if (index < ANSWER_COUNT){
        throw "Not enough answers for question.";
    }

    // Shuffle the answers, excluding the first element.
    for (var j = 1; j < answersCopy.length; j++){
        var rand = Math.floor(Math.random() * (index - 1)) + 1;
        index -= 1;

        var temp = answersCopy[index];
        answersCopy[index] = answersCopy[rand];
        answersCopy[rand] = temp;
    }

    // Swap the correct answer into the target location
    for (i = 0; i < ANSWER_COUNT; i++) {
        answers[i] = answersCopy[i];
    }
    temp = answers[0];
    answers[0] = answers[correctAnswerTargetLocation];
    answers[correctAnswerTargetLocation] = temp;
    return answers;
}

function handleAnswerRequest(intent, session, callback) {
    var speechOutput = "";
    var sessionAttributes = {};
    var gameInProgress = session.attributes && session.attributes.questions;
    var answerSlotValid = isAnswerSlotValid(intent);
    var userGaveUp = intent.name === "DontKnowIntent";

    if (!gameInProgress) {
        // If the user responded with an answer but there is no game in progress, ask the user
        // if they want to start a new game. Set a flag to track that we've prompted the user.
        sessionAttributes.userPromptedToContinue = true;
        speechOutput = "There is no session in progress. Do you want to start a new session? ";
        callback(sessionAttributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, speechOutput, false));
    } else if (!answerSlotValid && !userGaveUp) {
        // If the user provided answer isn't a number > 0 and < ANSWER_COUNT,
        // return an error message to the user. Remember to guide the user into providing correct values.
        var reprompt = session.attributes.speechOutput;
        var speechOutput = "Sorry, I didn't get that. " + reprompt;
        callback(session.attributes,
            buildSpeechletResponse(CARD_TITLE, speechOutput, reprompt, false));
    } else {
        var gameQuestions = session.attributes.questions,
            correctAnswerIndex = parseInt(session.attributes.correctAnswerIndex),
            currentScore = parseInt(session.attributes.score),
            currentQuestionIndex = parseInt(session.attributes.currentQuestionIndex),
            correctAnswerText = session.attributes.correctAnswerText;

        var speechOutputAnalysis = "";
        // if currentQuestionIndex is 4, we've reached 5 questions (zero-indexed) and can exit the game session
        if (currentQuestionIndex == GAME_LENGTH - 1) {
            speechOutput += speechOutputAnalysis +  "That's all the questions we have for you. " + "Thank you for practicing your interview with Interview Assistant!";
            callback(session.attributes,
                buildSpeechletResponse(CARD_TITLE, speechOutput, "", true));
        } else {
            currentQuestionIndex += 1;
            // general questions if first half, technical otherwise
            if (currentQuestionIndex < Math.ceil(GAME_LENGTH/2))
            {
                var spokenQuestion = Object.keys(questions[gameQuestions[currentQuestionIndex]]);
            }
            else
            {
                var spokenQuestion = Object.keys(technical_questions[gameQuestions[currentQuestionIndex]]);
            }
            // Generate a random index for the correct answer, from 0 to 3
            correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
            var roundAnswers = populateRoundAnswers(gameQuestions, currentQuestionIndex, correctAnswerIndex),

                questionIndexForSpeech = currentQuestionIndex + 1,
                repromptText =  spokenQuestion ;
            for (var i = 0; i < ANSWER_COUNT; i++) {
                repromptText +=  ""
            }
            speechOutput += repromptText;

            sessionAttributes = {
                "speechOutput": repromptText,
                "repromptText": repromptText,
                "currentQuestionIndex": currentQuestionIndex,
                "questions": gameQuestions,
                "score": currentScore,
                };
            if(currentQuestionIndex == Math.ceil(GAME_LENGTH/2))
                callback(sessionAttributes,
                    buildSpeechletResponse(CARD_TITLE, "Okay. Now time for technical questions. Please get a piece of paper and a pen. " + speechOutput, repromptText, false));
            else {
                callback(sessionAttributes,
                    buildSpeechletResponse(CARD_TITLE, "Okay. Now. " + speechOutput, repromptText, false));
                }
            

        }
    }
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new game session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Set a flag to track that we're in the Help state.
    if (session.attributes) {
        session.attributes.userPromptedToContinue = true;
    } else {
        // In case user invokes and asks for help simultaneously.
        session.attributes = { userPromptedToContinue: true };
    }
    
    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.

    var speechOutput = "To start a new session at any time, say, start new practice. "
        + "To repeat the last element, say, repeat. "
        + "Would you like to keep playing?",
        repromptText = "Would you like to keep practicing?";
        var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}

function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a custom closing statment when the user wants to quit the game
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Thank you for practicing your interview with Interview Assistant!", "", true));
}

function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return 1;
}

// ------- Helper functions to build responses -------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}