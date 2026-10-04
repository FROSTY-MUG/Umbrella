git add .
git commit -m "fix(frontend): enhance desktop icon grid, canvas roundRect compatibility, and terminal offline resilience"
Remove-Item env:GITHUB_TOKEN -ErrorAction SilentlyContinue
gh auth switch --user Skeletor-Pirate
$token = (gh auth token -u Skeletor-Pirate).Trim()
git remote set-url origin "https://Skeletor-Pirate:${token}@github.com/Skeletor-Pirate/Umbrella.git"
git push origin main
git remote set-url origin "https://github.com/Skeletor-Pirate/Umbrella.git"
