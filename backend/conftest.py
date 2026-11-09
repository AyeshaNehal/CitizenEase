import sys
import os

# Ensure project root and backend are in sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))

if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
