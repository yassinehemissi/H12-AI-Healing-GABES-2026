from langgraph.graph import END, START, StateGraph

from app.agents.recycling.nodes import (
    extract_reusable_materials_node,
    format_final_response_node,
    generate_eco_advice_node,
    generate_recycling_guidance_node,
    generate_upcycling_ideas_node,
    identify_waste_text_node,
    identify_waste_vision_node,
)
from app.agents.recycling.state import RecyclingState


def create_recycling_graph():
    workflow = StateGraph(RecyclingState)

    workflow.add_node("identify_waste_text", identify_waste_text_node)
    workflow.add_node("identify_waste_vision", identify_waste_vision_node)
    workflow.add_node("extract_reusable_materials", extract_reusable_materials_node)
    workflow.add_node("generate_recycling_guidance", generate_recycling_guidance_node)
    workflow.add_node("generate_eco_advice", generate_eco_advice_node)
    workflow.add_node("generate_upcycling_ideas", generate_upcycling_ideas_node)
    workflow.add_node("format_final_response", format_final_response_node)

    def route_input(state: RecyclingState) -> str:
        if state.get("input_type") == "image":
            return "identify_waste_vision"
        return "identify_waste_text"

    workflow.add_conditional_edges(START, route_input)

    workflow.add_edge("identify_waste_text", "generate_recycling_guidance")
    workflow.add_edge("identify_waste_vision", "extract_reusable_materials")
    workflow.add_edge("extract_reusable_materials", "generate_recycling_guidance")
    workflow.add_edge("generate_recycling_guidance", "generate_eco_advice")

    # Only image analyses continue to the idea stage; text requests keep the previous behavior.
    def route_after_advice(state: RecyclingState) -> str:
        if state.get("input_type") == "image":
            return "generate_upcycling_ideas"
        return "format_final_response"

    workflow.add_conditional_edges("generate_eco_advice", route_after_advice)
    workflow.add_edge("generate_upcycling_ideas", "format_final_response")
    workflow.add_edge("format_final_response", END)

    return workflow.compile()


async def run_recycling_agent(inputs: dict) -> dict:
    graph = create_recycling_graph()
    result = await graph.ainvoke(inputs)
    return result
