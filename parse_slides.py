import os
import re
import json
import math

def clean_for_line_estimation(text):
    # Remove markdown bold/italics
    text = re.sub(r'\*\*\*([^*]+)\*\*\*', r'\1', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    # Remove links
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    # Remove inline code backticks
    text = re.sub(r'`([^`]+)`', r'\1', text)
    
    # Clean math commands
    def clean_math(match):
        math_content = match.group(1)
        cleaned = re.sub(r'\\[a-zA-Z]+', 'x', math_content)
        cleaned = re.sub(r'[{}]', '', cleaned)
        return cleaned

    text = re.sub(r'\$([^\$]+)\$', clean_math, text)
    return text

def estimate_visual_lines(body_text):
    if not body_text:
        return 0.0
        
    lines = body_text.split('\n')
    total_lines = 0.0
    current_list = []
    
    def process_current_list():
        nonlocal total_lines
        if not current_list:
            return
        
        is_two_col = len(current_list) >= 5
        item_visual_lines = []
        for line in current_list:
            is_indented = line.startswith(' ') or line.startswith('\t')
            if is_indented:
                is_two_col = False
            
            cleaned = clean_for_line_estimation(line.strip())
            cleaned = re.sub(r'^([-*+]|\d+\.)\s*', '', cleaned)
            
            lines_needed = math.ceil(len(cleaned) / 70.0)
            if lines_needed == 0:
                lines_needed = 1.0
            item_visual_lines.append(lines_needed)
            
        if is_two_col:
            # We also need to make sure all items are short (< 55 chars)
            for line in current_list:
                cleaned = clean_for_line_estimation(line.strip())
                cleaned = re.sub(r'^([-*+]|\d+\.)\s*', '', cleaned)
                if len(cleaned) >= 55:
                    is_two_col = False
                    break
                    
        if is_two_col:
            mid = math.ceil(len(current_list) / 2.0)
            col1 = item_visual_lines[:mid]
            col2 = item_visual_lines[mid:]
            list_height = max(sum(col1), sum(col2))
        else:
            list_height = sum(item_visual_lines)
            
        total_lines += list_height + 0.5  # lighter padding for lists
        current_list.clear()

    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            process_current_list()
            total_lines += 0.1  # lighter spacing for empty lines
            continue
            
        is_bullet = trimmed.startswith('-') or trimmed.startswith('*') or trimmed.startswith('+')
        is_numbered = re.match(r'^\d+\.', trimmed) is not None
        
        if is_bullet or is_numbered:
            current_list.append(line)
        else:
            process_current_list()
            if trimmed.startswith('$$') and trimmed.endswith('$$'):
                total_lines += 1.5  # lighter height for block math
            elif trimmed.startswith('>'):
                cleaned = clean_for_line_estimation(trimmed.replace('>', '', 1).strip())
                lines_needed = math.ceil(len(cleaned) / 80.0)
                total_lines += lines_needed + 0.3  # lighter padding for footnotes
            else:
                cleaned = clean_for_line_estimation(line)
                lines_needed = math.ceil(len(cleaned) / 70.0)
                total_lines += lines_needed + 0.2  # lighter padding for paragraphs
                
    process_current_list()
    return total_lines

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
    if first_part and not first_part.startswith("### Diapositiva"):
        title_match = re.search(r'^#\s+(.+)$', first_part, re.MULTILINE)
        if title_match:
            title = title_match.group(1).replace("Diapositivas de Estudio:", "").strip()
            
        subtitle_match = re.search(r'^##\s+(.+)$', first_part, re.MULTILINE)
        if subtitle_match:
            subtitle = subtitle_match.group(1).strip()
        start_index = 1
        
    slides_list = []
    cards_list = []
    current_theme = None
    
    # Iterate over the slide parts
    for idx, part in enumerate(slides_raw[start_index:], start=1):
        part = part.strip()
        if not part:
            continue
            
        # Check if this part is a theme definition instead of a slide
        # A theme definition has a H2 header (##) and NO H3 header (###)
        if part.startswith("##") and not "###" in part:
            theme_match = re.search(r'^##\s+(.+)$', part, re.MULTILINE)
            if theme_match:
                current_theme = theme_match.group(1).strip()
                print(f"Detectado tema: {current_theme}")
                continue
            
        # Parse Slide Header: '### Diapositiva X: Title'
        header_match = re.search(r'^###\s+Diapositiva\s+(\d+):\s*(.+)$', part, re.MULTILINE)
        if not header_match:
            # If it doesn't match the standard slide header, check if it's just '### Title'
            header_match = re.search(r'^###\s*(.+)$', part, re.MULTILINE)
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
        
        # Estimate visual lines to prevent overflow and scrollbars
        est_lines = estimate_visual_lines(body)
        if est_lines >= 11.0:
            print(f"\n[ERROR] Diapositiva {slide_num}: '{slide_title}'")
            print(f"        Supera el límite de renglones visuales ({est_lines:.1f} >= 11.0).")
            print(f"        Por favor, divídela en varias diapositivas en el archivo markdown.")
            print(f"        Contenido problemático:\n{body}\n")
            raise ValueError(f"Diapositiva {slide_num} excede el límite de renglones visuales ({est_lines:.1f} >= 11.0).")
        elif est_lines >= 9.5:
            print(f"[WARNING] Diapositiva {slide_num}: '{slide_title}'")
            print(f"          Está al límite de renglones visuales ({est_lines:.1f} >= 9.5).")
            
        slides_list.append({
            "id": slide_num,
            "title": slide_title,
            "content": body,
            "theme": current_theme
        })
        
        # Create exactly one card for the entire slide
        card_id = f"card_{slide_num}"
        cards_list.append({
            "id": card_id,
            "slide_id": slide_num,
            "type": "basic",
            "term": slide_title,
            "front": slide_title,
            "back": body,
            "context": None,
            "theme": current_theme
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
