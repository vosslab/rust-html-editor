use scraper::Html;

/// Result of splitting an HTML document into its parts.
#[derive(Debug, Clone)]
pub struct SplitHtml {
    pub doctype: String,
    pub head_content: String,
    pub body_content: String,
    /// True if the source file was a fragment (no <html>/<body> wrapper)
    pub is_fragment: bool,
}

/// Split a full HTML document into doctype, head, and body parts.
///
/// Handles two cases:
/// 1. Full HTML documents with <html>, <head>, <body> tags
/// 2. Body-only fragments (just content, no wrapper tags)
///
/// Uses string slicing to preserve the original head content verbatim
/// (scraper would normalize it). Falls back to scraper for body extraction.
pub fn split_html(raw: &str) -> SplitHtml {
    let lower = raw.to_lowercase();

    // Check if this is a fragment (no <html> or <body> tag)
    let has_html_tag = lower.contains("<html");
    let has_body_tag = lower.contains("<body");

    if !has_html_tag && !has_body_tag {
        // This is a body-only fragment -- return content as-is
        return SplitHtml {
            doctype: String::new(),
            head_content: String::new(),
            body_content: raw.to_string(),
            is_fragment: true,
        };
    }

    // Full document parsing
    let doctype = extract_doctype(raw);
    let head_content = extract_between_tags(raw, "head")
        .unwrap_or_default();
    let body_content = extract_body_with_scraper(raw);

    SplitHtml {
        doctype,
        head_content,
        body_content,
        is_fragment: false,
    }
}

/// Reassemble a full HTML document from its parts.
/// If the original was a fragment, returns just the body content.
pub fn reassemble_html(doctype: &str, head: &str, body: &str, is_fragment: bool) -> String {
    // Fragment files are saved as-is (no wrapping)
    if is_fragment {
        return body.to_string();
    }

    let mut result = String::new();
    if !doctype.is_empty() {
        result += doctype;
        result += "\n";
    }
    result += "<html>\n<head>\n";
    result += head;
    // Ensure head content ends with newline
    if !head.ends_with('\n') {
        result += "\n";
    }
    result += "</head>\n<body>\n";
    result += body;
    // Ensure body content ends with newline
    if !body.ends_with('\n') {
        result += "\n";
    }
    result += "</body>\n</html>\n";
    result
}

/// Extract the doctype declaration from the beginning of an HTML string.
fn extract_doctype(raw: &str) -> String {
    let lower = raw.to_lowercase();
    if let Some(start) = lower.find("<!doctype") {
        if let Some(end) = raw[start..].find('>') {
            return raw[start..start + end + 1].to_string();
        }
    }
    String::new()
}

/// Extract content between opening and closing tags using string slicing.
/// Preserves the raw content without normalization.
fn extract_between_tags(raw: &str, tag: &str) -> Option<String> {
    let lower = raw.to_lowercase();
    let open_tag = format!("<{}", tag);
    let close_tag = format!("</{}>", tag);

    // Find the opening tag
    let open_start = lower.find(&open_tag)?;
    // Find the end of the opening tag
    let after_open = raw[open_start..].find('>')?;
    let content_start = open_start + after_open + 1;

    // Find the closing tag
    let close_start = lower[content_start..].find(&close_tag)?;
    let content_end = content_start + close_start;

    Some(raw[content_start..content_end].to_string())
}

/// Extract body inner HTML using scraper for robust parsing.
fn extract_body_with_scraper(raw: &str) -> String {
    // First try string slicing for verbatim preservation
    if let Some(body) = extract_between_tags(raw, "body") {
        return body;
    }

    // Fallback: use scraper to parse and extract body children
    let document = Html::parse_document(raw);
    let body_selector = scraper::Selector::parse("body").unwrap();

    if let Some(body_element) = document.select(&body_selector).next() {
        body_element.inner_html()
    } else {
        // Last resort: return the whole thing
        raw.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_split_full_document() {
        let html = r#"<!DOCTYPE html>
<html>
<head>
<title>Test Chapter</title>
<link rel="stylesheet" href="book.css">
</head>
<body>
<h1>Hello World</h1>
<p>Test paragraph.</p>
</body>
</html>"#;

        let split = split_html(html);
        assert!(!split.is_fragment);
        assert_eq!(split.doctype, "<!DOCTYPE html>");
        assert!(split.head_content.contains("<title>Test Chapter</title>"));
        assert!(split.body_content.contains("<h1>Hello World</h1>"));

        // Reassemble and verify structure
        let reassembled = reassemble_html(
            &split.doctype, &split.head_content, &split.body_content, false,
        );
        assert!(reassembled.contains("<!DOCTYPE html>"));
        assert!(reassembled.contains("<title>Test Chapter</title>"));
        assert!(reassembled.contains("<h1>Hello World</h1>"));
    }

    #[test]
    fn test_split_fragment() {
        let html = r#"<p>
WeBWorK delivers automatically graded questions.
</p>

<h2>Section title</h2>
<p>More content here.</p>"#;

        let split = split_html(html);
        assert!(split.is_fragment);
        assert!(split.doctype.is_empty());
        assert!(split.head_content.is_empty());
        assert_eq!(split.body_content, html);

        // Reassemble fragment -- should return body as-is
        let reassembled = reassemble_html("", "", &split.body_content, true);
        assert_eq!(reassembled, html);
    }
}
