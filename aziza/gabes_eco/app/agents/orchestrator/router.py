from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.core.llm_clients import get_text_llm

class RoutingDecision(BaseModel):
    destination: str = Field(description="Must be exactly 'transparency' or 'recycling'")
    extracted_location: str | None = Field(default=None, description="Location extracted if transparency, e.g., 'Gabès', 'Zone Industrielle Nord'. Or null.")

async def route_query(text: str) -> RoutingDecision:
    llm = get_text_llm()
    parser = PydanticOutputParser(pydantic_object=RoutingDecision)
    
    prompt = PromptTemplate(
        template="""You are an intelligent router for the Gabès Eco platform.
Analyze the user input and decide which agent should handle it.

- 'transparency': For inputs related to pollution, air quality, health risks, reporting an environmental issue, or requesting transparency data.
- 'recycling': For inputs related to waste sorting, recycling methods, or disposing of objects.

{format_instructions}

User Input: {input}
""",
        input_variables=["input"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    try:
        decision = await chain.ainvoke({"input": text})
        return decision
    except Exception as e:
        print(f"Routing fallback due to error: {e}")
        # Fallback to recycling if we can't parse
        return RoutingDecision(destination="recycling", extracted_location=None)
