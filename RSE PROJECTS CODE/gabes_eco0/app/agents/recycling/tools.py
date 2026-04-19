from langchain_community.tools.tavily_search import TavilySearchResults
from app.core.config import settings

def search_recycling_info(query: str) -> str:
    """Recherche sur le web des informations sur le recyclage pour la requête donnée."""
    if not settings.TAVILY_API_KEY:
        return "Recherche non disponible : clé Tavily manquante."
        
    try:
        search = TavilySearchResults(
            max_results=3,
            search_depth="advanced",
            tavily_api_key=settings.TAVILY_API_KEY
        )
        results = search.invoke({"query": query})
        
        if isinstance(results, list):
            context = "\n".join([f"- {r.get('content', '')}" for r in results])
            return context
        return str(results)
    except Exception as e:
        return f"Erreur de recherche: {str(e)}"

def categorize_waste(category: str) -> str:
    valid_categories = ["plastique", "verre", "métal", "papier", "organique", "électronique", "dangereux", "mixte"]
    category = category.lower()
    for valid in valid_categories:
        if valid in category:
            return valid
    return "mixte"
