from langgraph.graph import StateGraph, END
from app.agents.transparency.state import TransparencyState
from app.agents.transparency.nodes import (
    load_data_node,
    analyze_pollution_node,
    generate_alert_node,
    generate_recommendations_node,
    format_final_response_node,
    categorize_report_node,
    credibility_score_node,
    geolocate_node,
    cluster_reports_node
)

def create_transparency_graph():
    workflow = StateGraph(TransparencyState)
    
    workflow.add_node("load_data", load_data_node)
    
    # Community Reporting Nodes
    workflow.add_node("categorize_reports", categorize_report_node)
    workflow.add_node("score_credibility", credibility_score_node)
    workflow.add_node("geolocate", geolocate_node)
    workflow.add_node("cluster_reports", cluster_reports_node)
    
    workflow.add_node("analyze_pollution", analyze_pollution_node)
    workflow.add_node("generate_alert", generate_alert_node)
    workflow.add_node("generate_recommendations", generate_recommendations_node)
    workflow.add_node("format_final_response", format_final_response_node)
    
    workflow.set_entry_point("load_data")
    
    workflow.add_edge("load_data", "categorize_reports")
    workflow.add_edge("categorize_reports", "score_credibility")
    workflow.add_edge("score_credibility", "geolocate")
    workflow.add_edge("geolocate", "cluster_reports")
    workflow.add_edge("cluster_reports", "analyze_pollution")
    
    workflow.add_edge("analyze_pollution", "generate_alert")
    workflow.add_edge("generate_alert", "generate_recommendations")
    workflow.add_edge("generate_recommendations", "format_final_response")
    workflow.add_edge("format_final_response", END)
    
    return workflow.compile()

async def run_transparency_agent(inputs: dict) -> dict:
    graph = create_transparency_graph()
    result = await graph.ainvoke(inputs)
    return result
