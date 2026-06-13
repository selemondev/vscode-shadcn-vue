import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ROOT = "package.json";
const args = process.argv.slice(2);
const explicit = args.find((a) => /^\d+\.\d+\.\d+/.test(a));
const bumpFlag = args.filter((a) => a.startsWith("--")).join(" ");

let version;

if (explicit) {
	const pkg = JSON.parse(readFileSync(ROOT, "utf8"));
	pkg.version = explicit;
	writeFileSync(ROOT, JSON.stringify(pkg, null, 2) + "\n");
	execSync("pnpx changelogen@latest", { stdio: "inherit" });
	version = explicit;
} else {
	execSync(`pnpx changelogen@latest --bump --hideAuthorEmail ${bumpFlag}`, {
		stdio: "inherit",
	});
	version = JSON.parse(readFileSync(ROOT, "utf8")).version;
	const pkg = JSON.parse(readFileSync(ROOT, "utf8"));
	pkg.version = version;
	writeFileSync(ROOT, JSON.stringify(pkg, null, 2) + "\n");
}

execSync("git add -A", { stdio: "inherit" });
execSync(`git commit -m "chore(release): v${version}"`, { stdio: "inherit" });
execSync(`git tag -a v${version} -m "v${version}"`, { stdio: "inherit" });
execSync("git push --follow-tags", { stdio: "inherit" });
execSync(`pnpx changelogen@latest gh release v${version}`, {
	stdio: "inherit",
});
