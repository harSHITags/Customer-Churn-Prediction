# Advanced Dynamic Retention Recommender

def get_retention_recommendations(shap_explanation: list[dict], customer: dict) -> list[str]:
    """
    Generate highly personalized, multi-attribute retention recommendations by combining 
    local SHAP drivers with raw demographic and financial profile attributes.
    """
    recommendations = []
    
    # Retrieve key raw variables safely
    age = float(customer.get("Age", 0))
    balance = float(customer.get("Balance", 0))
    is_active = int(customer.get("IsActiveMember", 1))
    products = int(customer.get("NumOfProducts", 1))
    geography = str(customer.get("Geography", "")).strip()
    
    # Get top SHAP drivers
    top_drivers = [item["feature"].lower() for item in shap_explanation]
    
    # 1. VIP HIGH-VALUE RETENTION RULE (Age > 45, High Balance, Inactive)
    if age >= 45 and balance > 50000 and is_active == 0:
        recommendations.append(
            "VIP RETENTION INITIATIVE: Assign a senior relationship manager to arrange a face-to-face portfolio review. Offer tailored wealth management options and premium deposit rates."
        )
        
    # 2. INACTIVE MULTI-PRODUCT ENGAGEMENT RULE (Inactive, has multiple products)
    if is_active == 0 and products >= 2:
        recommendations.append(
            "MULTI-PRODUCT RE-ACTIVATION: Trigger an automated cross-product loyalty fee waiver and dispatch a personalized walkthrough highlighting combined account benefits."
        )
        
    # 3. GERMAN DEPOSIT STIMULUS RULE (Germany, High Churn Region, Zero/Low Balance)
    if geography.lower() == "germany" and balance == 0:
        recommendations.append(
            "GERMAN DEPOSIT GROWTH PROMOTION: Proactively offer a temporary high-yield savings booster rate (+1.5% APY) for new deposits above €10,000 to recapture account activity."
        )
        
    # 4. CRITICAL PRODUCT OVER-SATURATION RULE (Products >= 3, which is the highest churn driver)
    if products >= 3:
        recommendations.append(
            "PRODUCT CONSOLIDATION SURVEY: Contact the client to review their active products. Offer to consolidate their packages into a single streamlined low-fee tier."
        )

    # 5. CREDIT SCORE STABILISATION RULE (Credit Score < 550, Low Balance)
    credit_score = float(customer.get("CreditScore", 800))
    if credit_score < 550:
        recommendations.append(
            "CREDIT HEALTH ASSISTANCE: Share a complimentary credit score health checklist and propose a zero-fee credit-builder card option."
        )

    # 6. SHAP-specific fallback recommendations if list is still not filled
    for item in shap_explanation:
        if len(recommendations) >= 3:
            break
            
        feat = item["feature"].lower()
        val = item["shap_value"]
        
        if feat == "age" and val > 0:
            rec = "SENIOR LOYALTY OFFER: Present a customized senior banking package with reduced branch transaction fees and priority service queue access."
            if rec not in recommendations:
                recommendations.append(rec)
        elif feat == "numofproducts" and val > 0:
            rec = "PORTFOLIO ADJUSTMENT: Suggest transitioning the client to a bundled product tier matching their current spending habits."
            if rec not in recommendations:
                recommendations.append(rec)
        elif feat == "isactivemember" and val > 0:
            rec = "DIGITAL ENGAGEMENT CALL: Initiate a personalized outreach call by digital banking support to assist with mobile app setup and online portal utilities."
            if rec not in recommendations:
                recommendations.append(rec)
        elif feat == "balance" and val > 0:
            rec = "DEPOSIT INTEREST INCENTIVE: Provide a targeted cash-back incentive for maintaining a minimum monthly balance over €5,000."
            if rec not in recommendations:
                recommendations.append(rec)
        elif feat == "geography" and val > 0:
            rec = "REGIONAL RETENTION OFFER: Offer local branch perks and region-specific cashbacks tailored to their primary residency area."
            if rec not in recommendations:
                recommendations.append(rec)
                
    # 7. General Fallbacks if we still have less than 3 recommendations
    fallbacks = [
        "Initiate a personalized relationship check-in call from the customer care squad.",
        "Provide a monthly maintenance fee waiver for the next 3 billing cycles.",
        "Conduct a brief customer feedback survey to pinpoint banking dissatisfaction factors."
    ]
    
    for fb in fallbacks:
        if len(recommendations) >= 3:
            break
        if fb not in recommendations:
            recommendations.append(fb)
            
    return recommendations[:3]
