import logging
import asyncio
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

# Mock database of government schemes
# In a production environment, this would be stored in MongoDB
SCHEMES_DB = [
    {
        "id": "pradhan_mantri_ujjwala_yojana",
        "title": "Pradhan Mantri Ujjwala Yojana",
        "description": "Free LPG connections to women from BPL households",
        "eligibility": "Women from BPL households without LPG connection",
        "eligibility_criteria": {
            "income_level": ["bpl"],
            "has_lpg_connection": False
        },
        "documents": [
            "Aadhaar Card", 
            "BPL Ration Card", 
            "Bank Account Details"
        ],
        "steps": [
            "Visit nearest LPG distributor",
            "Fill application form",
            "Submit required documents",
            "Receive LPG connection"
        ],
        "benefits": "Free LPG connection with financial assistance for first refill and stove."
    },
    {
        "id": "pradhan_mantri_matru_vandana_yojana",
        "title": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "description": "Cash benefits for pregnant and lactating mothers",
        "eligibility": "Pregnant and lactating mothers for first child",
        "eligibility_criteria": {
            "is_pregnant": True,
            "children_count": [0]
        },
        "documents": [
            "Aadhaar Card", 
            "Bank Account Details", 
            "MCP Card"
        ],
        "steps": [
            "Register at local Anganwadi center",
            "Fill PMMVY application form",
            "Submit required documents",
            "Receive benefits in bank account"
        ],
        "benefits": "Cash benefit of ₹5,000 in three installments for pregnancy and lactation support."
    },
    {
        "id": "sukanya_samriddhi_yojana",
        "title": "Sukanya Samriddhi Yojana",
        "description": "Small savings scheme for girl child",
        "eligibility": "Parents of girl child below 10 years",
        "eligibility_criteria": {
            "has_daughter": True,
            "daughter_age": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        "documents": [
            "Birth Certificate of Girl Child", 
            "ID Proof of Parents/Guardian", 
            "Address Proof"
        ],
        "steps": [
            "Visit nearest post office or authorized bank",
            "Fill account opening form",
            "Submit required documents",
            "Make initial deposit (minimum ₹250)"
        ],
        "benefits": "High interest rate savings account for girl child's education and marriage expenses."
    },
    {
        "id": "pm_kisan_samman_nidhi",
        "title": "PM Kisan Samman Nidhi",
        "description": "Income support for farmers",
        "eligibility": "Small and marginal farmers with cultivable land",
        "eligibility_criteria": {
            "is_farmer": True,
            "land_holding": ["small", "marginal"]
        },
        "documents": [
            "Aadhaar Card", 
            "Land Records", 
            "Bank Account Details"
        ],
        "steps": [
            "Register online or at Common Service Centre",
            "Fill application form",
            "Submit required documents",
            "Verification by local authorities"
        ],
        "benefits": "₹6,000 per year in three installments of ₹2,000 each."
    },
    {
        "id": "ayushman_bharat",
        "title": "Ayushman Bharat Yojana",
        "description": "Health insurance for poor and vulnerable families",
        "eligibility": "Poor and vulnerable families as per SECC database",
        "eligibility_criteria": {
            "income_level": ["bpl", "low"]
        },
        "documents": [
            "Aadhaar Card", 
            "Ration Card", 
            "Any Government ID"
        ],
        "steps": [
            "Check eligibility on official website or at Ayushman Bharat Kendra",
            "Register at nearest Ayushman Bharat Kendra",
            "Submit required documents",
            "Receive Ayushman Bharat card"
        ],
        "benefits": "Health coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization."
    }
]

async def match_schemes(user_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Match government schemes based on user profile information.
    
    Args:
        user_profile: Dictionary containing user profile information
        
    Returns:
        List of matched government schemes
    """
    try:
        logger.info(f"Matching schemes for user profile: {user_profile}")
        
        # Simulate processing time
        await asyncio.sleep(1)
        
        matched_schemes = []
        
        # In a production environment, this would be a database query
        for scheme in SCHEMES_DB:
            is_match = True
            
            # Check eligibility criteria
            if "eligibility_criteria" in scheme:
                for key, value in scheme["eligibility_criteria"].items():
                    if key in user_profile:
                        # Handle list type criteria (e.g., income levels, age ranges)
                        if isinstance(value, list):
                            if user_profile[key] not in value:
                                is_match = False
                                break
                        # Handle boolean criteria
                        elif isinstance(value, bool):
                            if user_profile[key] != value:
                                is_match = False
                                break
                        # Handle other types
                        else:
                            if user_profile[key] != value:
                                is_match = False
                                break
            
            if is_match:
                matched_schemes.append(scheme)
        
        # If no exact matches, return schemes with minimal requirements
        if not matched_schemes:
            for scheme in SCHEMES_DB:
                # Check if scheme has Aadhaar as the only requirement
                if "has_aadhaar" in user_profile and user_profile["has_aadhaar"] and \
                   "Aadhaar Card" in scheme.get("documents", []):
                    matched_schemes.append(scheme)
        
        # Limit to top 3 schemes
        matched_schemes = matched_schemes[:3]
        
        logger.info(f"Matched {len(matched_schemes)} schemes")
        return matched_schemes
        
    except Exception as e:
        logger.error(f"Error matching schemes: {str(e)}")
        # Return empty list in case of error
        return []

async def get_scheme_by_id(scheme_id: str) -> Optional[Dict[str, Any]]:
    """
    Get scheme details by ID.
    
    Args:
        scheme_id: ID of the scheme
        
    Returns:
        Scheme details or None if not found
    """
    try:
        for scheme in SCHEMES_DB:
            if scheme["id"] == scheme_id:
                return scheme
        return None
    except Exception as e:
        logger.error(f"Error getting scheme by ID: {str(e)}")
        return None