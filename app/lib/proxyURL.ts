export default function proxyURL(url: string) {
	const isDiscordActivity = window.location.href.includes("discordsays.com");
	if (isDiscordActivity) {
		return "/.proxy" + url;
	}
	return url;
}
