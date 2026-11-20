# Hint 2

For each module reached at load time, look for code at the top level (outside any function). Which module reads `document` while it is being evaluated? Which import path brings the public headless consumer to it, even though the factory itself only uses a type-only `Renderer`?
