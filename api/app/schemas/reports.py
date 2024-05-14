from pydantic import BaseModel

class ExampleSchema(BaseModel):
    name: str
    age: int

class AnotherSchema(BaseModel):
    email: str
