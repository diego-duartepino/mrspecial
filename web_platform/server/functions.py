# Put any local Python you want to trigger here.
import os, platform

def add(a: float, b: float):
    return a + b

def word_count(text: str):
    return {"words": len(text.split())}

def system_info():
    return {"python": platform.python_version(), "cwd": os.getcwd()}
