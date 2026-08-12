import os
import re

def renumber_slides():
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(workspace_dir, "Docs", "Teoria de la computacion.md")
    
    if not os.path.exists(md_path):
        print(f"Error: markdown file not found at {md_path}")
        return
        
    print(f"Reading {md_path}")
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    new_lines = []
    slide_counter = 1
    modified_count = 0
    
    for line_num, line in enumerate(lines, 1):
        # Match standard slide header: ### Diapositiva X: Title (where X can contain letters/suffixes)
        match = re.match(r'^(#{2,3}\s+[Dd]iapositiva\s+)([^:]+)(:\s*)(.+)$', line)
        if match:
            prefix = match.group(1)
            old_num_str = match.group(2).strip()
            title = match.group(4)
            
            hashes = prefix.split()[0]
            # Format new header
            new_header = f"{hashes} Diapositiva {slide_counter}: {title.strip()}\n"
            
            # Convert to int for comparison if possible, otherwise string comparison
            is_different = True
            try:
                if int(old_num_str) == slide_counter and line == new_header:
                    is_different = False
            except ValueError:
                pass
                
            if is_different:
                print(f"Renumbering slide at line {line_num}: {old_num_str} -> {slide_counter} ('{title.strip()}')")
                modified_count += 1
            
            new_lines.append(new_header)
            slide_counter += 1
        else:
            new_lines.append(line)
            
    if modified_count > 0:
        with open(md_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Successfully renumbered {modified_count} slide headers. Total slides: {slide_counter - 1}.")
    else:
        print("No slide renumbering was necessary. Everything is already sequential.")

if __name__ == "__main__":
    renumber_slides()
