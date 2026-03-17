export async function fetchNewsData() {
    try {
        // This calls the router.get("/hirek", ...) defined in your Node app
        const response = await fetch('/getHirek'); 
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not fetch news:", error);
        return []; // Return empty array on failure
    }
}

export function parseArticleText(text) {
    if (text && text.includes("-")) {
        const parts = text.split("-");
        const imageName = parts[0].trim();
        const cleanText = parts.slice(1).join("-").trim();
        return {
            imagePath: `./images/${imageName}`,
            text: cleanText
        };
    }
    return {
        imagePath: null,
        text: text
    };
}