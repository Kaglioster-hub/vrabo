
## How to push to GitHub and deploy (Windows / PowerShell)

1. Clone your repo locally if not already:
```powershell
git clone https://github.com/Kaglioster-hub/vrabo.git "$HOME\Desktop\vrabo"
```

2. Extract the ZIP you downloaded. Inside the folder, run:
```powershell
.\scripts\setup.ps1 -RepoPath "$HOME\Desktop\vrabo"
```

3. The script copies files, installs deps, commits, pushes, and runs `vercel --prod`.
4. In Vercel dashboard, set **vrabo.it** as primary domain for the project.
