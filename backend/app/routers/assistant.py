from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import AgentChatRequest, AgentChatResponse
from ..services.recruiter_agent import process_agent_query

router = APIRouter(prefix="/api/v1/assistant", tags=["AI Recruiter Assistant"])

@router.post("/chat", response_model=AgentChatResponse)
def agent_chat(req: AgentChatRequest, db: Session = Depends(get_db)):
    res = process_agent_query(
        message=req.message,
        db=db,
        context_job_id=req.context_job_id
    )
    return res
