# banking_functions.py
# Extracted banking service functions from 1.py

def check_balance(user_input):
    return """To check your account balance:
        
        SMS Method:
- Send SMS \"BAL\" to 9212632199
    - You'll receive balance via SMS
        
        Mobile Banking:
- Login to BoM Mobile App
    - Go to Account Summary
        - Your balance will be displayed
        
        ATM Method:
- Insert debit card at any BoM ATM
    - Enter PIN and select Balance Inquiry
        
        Missed Call:
- Give missed call to 9212132199
    - You'll receive SMS with balance"""

def transfer_money(user_input):
    return """Money Transfer Options:

UPI(Instant):
- Open BoM UPI app or any UPI app
    - Enter recipient's UPI ID or scan QR
        - Enter amount and authenticate

IMPS(Immediate):
- Login to mobile banking
    - Select IMPS transfer
        - Enter beneficiary details and amount

NEFT(Within 2 hours):
- Available 24x7 except 2nd & 4th Saturday
    - Add beneficiary first, then transfer

RTGS(Real - time, above ₹2 lakh):
- For high - value transactions
    - Available on working days 7 AM to 6 PM"""

def loan_eligibility(user_input):
    return """Kisan Credit Card Loan Eligibility:
        
        Eligibility Criteria:
- Must be a farmer(owner / tenant)
    - Age: 18 - 75 years
        - Should have cultivable land
        
        Required Documents:
- Land records(7 / 12, 8A)
    - Aadhaar Card
        - PAN Card
            - Passport size photos
                - Bank statements(6 months)
                    - Income certificate
        
        Loan Amount: Up to ₹3 lakh for crop loans
        Interest Rate: 7 % per annum(with subsidy)
Repayment: After harvest season"""

def link_aadhaar(user_input):
    return """Link Aadhaar to Bank Account:
        
        Online Method:
- Visit BoM internet banking
    - Go to Services > Link Aadhaar
        - Enter 12 - digit Aadhaar number
            - Enter OTP received on mobile
        
        Branch Visit:
- Visit nearest BoM branch
    - Carry original Aadhaar card
        - Fill Aadhaar linking form
            - Submit to bank officer
        
        SMS Method:
- Send SMS: LINKAADHAAR < SPACE > Account Number < SPACE > Aadhaar Number
    - Send to 9212332199

Note: Linking is mandatory as per RBI guidelines"""

def activate_mobile_banking(user_input):
    return """Activate Mobile Banking:
        
        Step 1: Download BoM Mobile App from Play Store / App Store
        
        Step 2: Registration
    - Click 'New User Registration'
        - Enter account number and mobile number
            - Set MPIN(4 - digit)
        
        Step 3: Verification
    - OTP will be sent to registered mobile
        - Enter OTP to complete activation
        
        Step 4: Login
    - Use Customer ID and MPIN to login
        
        For help: Call customer care 1800 - 233 - 4526

Features: Balance check, money transfer, bill payments, mini statement"""

def open_fd_rd(user_input):
    return """Open Fixed Deposit (FD) / Recurring Deposit (RD):
        
        Fixed Deposit:
- Minimum amount: ₹1,000
    - Tenure: 7 days to 10 years
        - Interest rates: 3.5 % to 6.75 % (varies by tenure)
        
        Recurring Deposit:
- Minimum monthly deposit: ₹100
    - Tenure: 1 to 10 years
        - Interest rates: Similar to FD rates
        
        How to Open:
1. Visit BoM branch with documents
        2. Through mobile banking app
3. Internet banking portal
        
        Required Documents:
- PAN Card, Aadhaar Card
    - Passport size photo
        - Account opening form

Benefits: Higher interest than savings account, loan against FD available"""

def card_services(user_input):
    return """Debit Card Services:
        
        Activate New Card:
- Visit any BoM ATM
    - Insert card and enter temporary PIN
        - Change to new 4 - digit PIN
            - Card activated immediately
        
        Block Lost / Stolen Card:
- Call 24x7 helpline: 1800 - 233 - 4526
    - SMS 'BLOCK XXXX' to 9212332199(XXXX = last 4 digits)
        - Visit branch with ID proof
        
        PIN Reset:
- Visit any BoM ATM
    - Select 'PIN Change' option
        - Enter old PIN and set new PIN
        
        Card Replacement:
- Apply through mobile banking
    - Visit branch with application
    - Charges: ₹150 + GST"""

def find_branch_atm(user_input):
    return """Find Nearest BoM Branch/ATM:
        
        Online Branch Locator:
- Visit www.bankofmaharashtra.in
    - Click on 'Branch/ATM Locator'
        - Enter PIN code or city name
        
        Mobile App:
- Open BoM Mobile App
    - Select 'Branch/ATM Locator'
        - Allow location access or enter PIN
        
        Customer Care:
- Call 1800 - 233 - 4526
    - Provide your PIN code
        - Get nearest branch details
        
        Major Cities Coverage:
- 2800 + branches across India
    - 2400 + ATMs
    - Maximum branches in Maharashtra
        - Expanding nationwide with 50 + branches outside Maharashtra"""

def mini_statement(user_input):
    return """Get Mini Statement:
        
        Missed Call Method:
- Give missed call to 9212132199
    - Receive mini statement via SMS
        
        SMS Method:
- Send 'MINI' to 9212632199
    - Last 5 transactions will be sent
        
        ATM Method:
- Visit any BoM ATM
    - Insert card, enter PIN
        - Select 'Mini Statement'
            - Print statement
        
        Mobile Banking:
- Login to BoM app
    - Go to 'Account Statement'
        - Select date range
            - View / download statement

Charges: Free for missed call and SMS methods"""

def fraud_prevention(user_input):
    return """UPI Fraud Prevention - Safety Tips:
        
        DO's:
        ✓ Verify merchant before payment
        ✓ Check transaction amount before confirming
        ✓ Use only official bank apps
        ✓ Keep UPI PIN confidential
        ✓ Enable transaction alerts
        
        DON'Ts:
        ✗ Never share UPI PIN with anyone
        ✗ Don't click suspicious payment links
        ✗ Never accept money from unknown sources
        ✗ Don't install apps from unknown sources
        ✗ Never give remote access to phone
        
        If Fraud Occurs:
- Immediately call 1930(Cyber Crime Helpline)
    - Block UPI ID through app
        - Report to bank: 1800 - 233 - 4526
            - File police complaint
                - Contact 155260 for financial fraud reporting"""

def rekyc_process(user_input):
    return """Re-KYC Process:
        
        When Required:
- KYC documents older than 10 years
    - Change in address / phone number
        - Bank notification for update
        
        Required Documents:
    - Updated Aadhaar Card
        - PAN Card
            - Recent photograph
                - Address proof(if changed)

    Process:
    1. Visit BoM branch
2. Fill Re - KYC form
3. Submit updated documents
4. Provide biometric verification
5. Process completion in 7 - 10 days
        
        Online Option:
- Video KYC through mobile banking
    - Schedule appointment online
        - Complete from home

Penalty: Account restrictions if not completed within timeline"""

def reset_mpin(user_input):
    return """Reset MPIN Securely:
        
        Through Mobile App:
1. Open BoM Mobile Banking app
2. Click 'Forgot MPIN'
3. Enter account number and registered mobile
4. Verify OTP
5. Set new 4 - digit MPIN
        
        Through ATM:
1. Visit any BoM ATM
2. Insert debit card
3. Select 'MPIN Services'
4. Choose 'Generate MPIN'
5. Enter debit card PIN
6. Set new MPIN
        
        Through SMS:
- Send 'MPIN<space>Account Number' to 9212332199
    - Follow instructions in response SMS
        
        Security Tips:
- Use unique 4 - digit combination
    - Don't use birthdate or repetitive numbers
        - Change MPIN regularly
            - Never share with anyone"""

def general_inquiry(user_input):
    return """Welcome to Bank of Maharashtra!
        
        I can help you with:
- Account balance inquiry
    - Money transfers(UPI / NEFT / RTGS / IMPS)
        - Loan information
            - Mobile banking activation
                - Card services
                    - Branch / ATM locator
                        - Safety tips and fraud prevention
        
        Customer Care: 1800 - 233 - 4526(24x7)
        
        Please ask me about any specific banking service you need help with."""
