# understand_intent.py
# Extracted from 1.py
import sys

def understand_intent(user_input, language, gemini_model, banking_functions, logger):
    """Use Gemini to understand user intent and select appropriate function"""
    try:
        # Simple text cleaning without complex encoding
        user_input_clean = str(user_input).strip()
        
        functions_list = ", ".join(banking_functions.keys())
        prompt = f"""
        You are a banking assistant. Analyze the user's query and determine which banking service they need.
        
        User query: "{user_input_clean}"
        Language: {language}
        
        Available banking functions:
    -check_balance: Check account balance via SMS/Mobile banking
    - transfer_money: Transfer money using RTGS/NEFT/IMPS / UPI
    - loan_eligibility: Check Kisan Credit Card eligibility and documentation
    - link_aadhaar: Link Aadhaar to bank account
    - activate_mobile_banking: Activate mobile banking services
    - open_fd_rd: Open Fixed Deposit or Recurring Deposit
    - card_services: Debit card activation / blocking services
    - find_branch_atm: Find nearby Bank of Maharashtra branches / ATMs
    - mini_statement: Get mini statements via missed call / SMS / app
    - fraud_prevention: UPI fraud prevention and safety tips and any type of fraud prevention
    - rekyc_process: Re - KYC process information
    - reset_mpin: Reset MPIN securely
    - general_inquiry: For very basic greetings or when user asks "what can you help with"
        
        IMPORTANT: 
        - Return ONLY the exact function name from the list above that best matches the user's intent.
        - Use "general_inquiry" ONLY for basic greetings like "hello", "hi", "what can you do", "help me".
        - If the query is about a specific banking topic but doesn't match any function exactly, return "UNRECOGNIZED".
        - If the query is unclear, complex, or asks for specific details/rates/processes, return "UNRECOGNIZED".
        """
        
        response = gemini_model.generate_content(prompt)
        intent = response.text.strip().lower()
        
        # Check if Gemini explicitly marked it as unrecognized
        if intent == "general_inquiry" or intent == "unrecognized":
            logger.warning(f"Intent explicitly unrecognized for query: {user_input_clean}")
            return "unrecognized_intent"
        
        # Check if intent is recognized and valid
        if intent in banking_functions:
            return intent
        else:
            # If intent is not recognized, mark it for unanswered handling
            logger.warning(f"Intent not found in banking functions for query: {user_input_clean}, got: {intent}")
            return "unrecognized_intent"
            
    except Exception as e:
        logger.error(f"Error in intent recognition: {str(e)}")
        return "unrecognized_intent"

def format_response(raw_response, language, user_query, gemini_model, logger):
    """Use Gemini to format the response in the user's language"""
    try:
        # Simple text cleaning without complex encoding
        user_query_clean = str(user_query).strip()
        raw_response_clean = str(raw_response).strip()
        
        prompt = f"""
        Format the following banking information response in {language} language in a helpful and conversational manner.
        Make sure the response is accurate, clear, and maintains the original information.
        Critical instructions,responses should be solely based on functions output (raw response give to you). Do no add anything else deviating from the original content of raw response.
        Original query: {user_query_clean}
        Raw response: {raw_response_clean}
        
        Provide a well-formatted, helpful response in {language} that a bank customer would understand easily.
        Keep the response concise but informative.
        I need to send this reponse to sarvam ai for text to speech and it is breaking in between because of line breaks give a response such that it will be shown good to output.
        sometimes it gives <break> in between and there are some new lines too so it is breaking there
        """
        
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
            
    except Exception as e:
        logger.error(f"Error in response formatting: {str(e)}")
        return raw_response 
