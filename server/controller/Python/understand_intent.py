# understand_intent.py
# Extracted from 1.py

def understand_intent(user_input, language, gemini_model, banking_functions, logger):
    """Use Gemini to understand user intent and select appropriate function"""
    functions_list = ", ".join(banking_functions.keys())
    prompt = f"""
        You are a banking assistant.Analyze the user's query and determine which banking service they need.
        
        User query: "{user_input}"
        Language: { language }
        
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
        
        Return ONLY the function name from the list above that best matches the user's intent.
        If no function matches, return "general_inquiry".
        """
    try:
        response = gemini_model.generate_content(prompt)
        intent = response.text.strip().lower()
        if intent in banking_functions:
            return intent
        else:
            return "general_inquiry"
    except Exception as e:
        logger.error(f"Error in intent recognition: {e}")
        return "general_inquiry"

def format_response(raw_response, language, user_query, gemini_model, logger):
    """Use Gemini to format the response in the user's language"""
    prompt = f"""
        Format the following banking information response in { language } language in a helpful and conversational manner.
        Make sure the response is accurate, clear, and maintains the original information.
        Critical instructions,responses should be solely based on functions output (raw response give to you). Do no add anything else deviating from the original content of raw response.
        Original query: { user_query }
        Raw response: { raw_response }
        
        Provide a well - formatted, helpful response in { language } that a bank customer would understand easily.
        Keep the response concise but informative.
        """
    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error in response formatting: {e}")
        return raw_response
