import os
import re
import json

def parse_markdown(filepath):
    print(f"Reading file: {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Normalize newlines
    content = content.replace('\r\n', '\n')

    # Split by slide separator: '---'
    # Use regex to find optional newlines, three or more dashes, and a newline
    slides_raw = re.split(r'\n---\n', content)
    
    # Defaults
    title = "Teoría de la Computación"
    subtitle = "Lenguajes, Lenguajes Regulares y Gramáticas"
    
    # Process the first block for title/subtitle if it doesn't look like a slide
    first_part = slides_raw[0].strip() if slides_raw else ""
    start_index = 0
    if first_part and not first_part.startswith("## Diapositiva"):
        title_match = re.search(r'^#\s+(.+)$', first_part, re.MULTILINE)
        if title_match:
            title = title_match.group(1).replace("Diapositivas de Estudio:", "").strip()
            
        subtitle_match = re.search(r'^##\s+(.+)$', first_part, re.MULTILINE)
        if subtitle_match:
            subtitle = subtitle_match.group(1).strip()
        start_index = 1
        
    slides_list = []
    cards_list = []
    
    # Iterate over the slide parts
    for idx, part in enumerate(slides_raw[start_index:], start=1):
        part = part.strip()
        if not part:
            continue
            
        # Parse Slide Header: '## Diapositiva X: Title'
        header_match = re.search(r'^##\s+Diapositiva\s+(\d+):\s*(.+)$', part, re.MULTILINE)
        if not header_match:
            # If it doesn't match the standard slide header, check if it's just '## Title'
            header_match = re.search(r'^##\s*(.+)$', part, re.MULTILINE)
            if not header_match:
                continue
            slide_num = idx
            slide_title = header_match.group(1).strip()
        else:
            slide_num = int(header_match.group(1))
            slide_title = header_match.group(2).strip()
            
        header_line = header_match.group(0)
        # Body is everything after the header line
        body = part[part.find(header_line) + len(header_line):].strip()
        
        slides_list.append({
            "id": slide_num,
            "title": slide_title,
            "content": body
        })
        
        # Create exactly one card for the entire slide
        card_id = f"card_{slide_num}"
        cards_list.append({
            "id": card_id,
            "slide_id": slide_num,
            "term": slide_title,
            "front": slide_title,
            "back": body,
            "context": None
        })
            
    # Clean up card back contents (strip outer whitespace, fix newlines)
    for card in cards_list:
        card["back"] = card["back"].strip()
        
    return {
        "title": title,
        "subtitle": subtitle,
        "slides": slides_list,
        "cards": cards_list
    }

def main():
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(workspace_dir, "Docs", "Teoria de la computacion.md")
    
    # Paths
    resources_dir = os.path.join(workspace_dir, "Resources")
    json_path = os.path.join(resources_dir, "ColoquioTeoriaComputacion.json")
    
    src_data_dir = os.path.join(workspace_dir, "src", "data")
    src_json_path = os.path.join(src_data_dir, "ColoquioTeoriaComputacion.json")
    
    if not os.path.exists(resources_dir):
        os.makedirs(resources_dir)
        print(f"Created directory: {resources_dir}")
        
    if not os.path.exists(src_data_dir):
        os.makedirs(src_data_dir)
        print(f"Created directory: {src_data_dir}")
        
    data = parse_markdown(md_path)
    
    print(f"Parsed {len(data['slides'])} slides and {len(data['cards'])} cards.")
    
    # Save to Resources
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved JSON to: {json_path}")
    
    # Save to src/data
    with open(src_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved JSON to: {src_json_path}")

if __name__ == "__main__":
    main()
