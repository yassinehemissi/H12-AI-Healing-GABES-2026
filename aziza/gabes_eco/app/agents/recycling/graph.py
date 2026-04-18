from langgraph.graph import StateGraph, START, END
from app.agents.recycling.state import RecyclingState
from app.agents.recycling.nodes import (
    identify_waste_text_node,
    identify_waste_vision_node,
    generate_recycling_guidance_node,
    generate_eco_advice_node,
    format_final_response_node
)

def create_recycling_graph():
    workflow = StateGraph(RecyclingState)
    
    workflow.add_node("identify_waste_text", identify_waste_text_node)
    workflow.add_node("identify_waste_vision", identify_waste_vision_node)
    workflow.add_node("generate_recycling_guidance", generate_recycling_guidance_node)
    workflow.add_node("generate_eco_advice", generate_eco_advice_node)
    workflow.add_node("format_final_response", format_final_response_node)
    
    def route_input(state: RecyclingState) -> str:
        if state.get("input_type") == "image":
            return "identify_waste_vision"
        return "identify_waste_text"
    
    workflow.add_conditional_edges(START, route_input)
    
    workflow.add_edge("identify_waste_text", "generate_recycling_guidance")
    workflow.add_edge("identify_waste_vision", "generate_recycling_guidance")
    workflow.add_edge("generate_recycling_guidance", "generate_eco_advice")
    workflow.add_edge("generate_eco_advice", "format_final_response")
    workflow.add_edge("format_final_response", END)
    
    return workflow.compile()

async def run_recycling_agent(inputs: dict) -> dict:
    graph = create_recycling_graph()
    result = await graph.ainvoke(inputs)
    return result
