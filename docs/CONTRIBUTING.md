# Contributing to TaskFlow

Thank you for your interest in contributing to TaskFlow! This document provides guidelines and instructions for contributing to our task management application.

## 🚀 Getting Started

### Prerequisites
- Git installed on your machine
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic understanding of HTML, CSS, and JavaScript
- GitHub account for collaboration

### Setting Up Development Environment
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/taskflow.git
cd taskflow

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL-OWNER/taskflow.git

# 4. Create feature branch
git checkout -b feature/your-feature-name

# 5. Open index.html in browser to start development
```

## 📋 How to Contribute

### 🐛 Reporting Bugs
1. **Check existing issues** to avoid duplicates
2. **Use bug report template** when creating new issues
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and device information
   - Screenshots if applicable

### ✨ Suggesting Features
1. **Use feature request template** for new ideas
2. **Describe the problem** the feature would solve
3. **Explain the proposed solution** in detail
4. **Consider user impact** and implementation complexity

### 🔧 Contributing Code

#### Branch Naming Convention
```
feature/task-priority-system     # New features
bugfix/search-filter-bug        # Bug fixes
docs/update-setup-guide         # Documentation
style/improve-button-styling    # Style improvements
refactor/organize-css-classes   # Code refactoring
```

#### Commit Message Format
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring without functionality change
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ui): add task priority system

- Add priority dropdown to task creation form
- Implement priority-based sorting and filtering
- Add priority color coding throughout UI
- Update statistics to include priority breakdown

Closes #42

fix(mobile): resolve search input alignment on small screens

The search input was extending beyond container bounds on
screens smaller than 480px. Added proper responsive styling.

Fixes #38

docs(readme): update installation instructions

- Add prerequisites section
- Include troubleshooting guide
- Update feature list with v2.0 enhancements
```

#### Code Style Guidelines

**HTML:**
- Use semantic HTML5 elements
- Include proper `alt` attributes for images
- Use meaningful `id` and `class` names
- Maintain proper indentation (2 spaces)

**CSS:**
- Follow BEM methodology for class naming
- Use CSS custom properties for theming
- Group related styles together
- Include comments for complex styles
- Mobile-first responsive design

**JavaScript:**
- Use ES6+ features (classes, arrow functions, const/let)
- Follow camelCase naming convention
- Add JSDoc comments for complex functions
- Handle errors appropriately
- Avoid global variables

#### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Follow code style guidelines
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature
   # Create pull request on GitHub using the PR template
   ```

5. **Address Review Feedback**
   - Make requested changes
   - Respond to comments constructively
   - Update PR when ready for re-review

6. **Merge Requirements**
   - ✅ All CI checks must pass
   - ✅ At least 1 approved review
   - ✅ No merge conflicts
   - ✅ Branch is up to date with main

## 🧪 Testing Guidelines

### Manual Testing Checklist
Before submitting a PR, ensure:
- [ ] **Functionality**: Feature works as intended
- [ ] **Cross-browser**: Tested in multiple browsers
- [ ] **Responsive**: Works on mobile, tablet, desktop
- [ ] **Performance**: No significant slowdowns
- [ ] **Accessibility**: Keyboard navigation works
- [ ] **Data Persistence**: Local storage functions correctly
- [ ] **Error Handling**: Graceful error handling

### Testing Your Changes
```bash
# 1. Open TaskFlow in browser
open index.html

# 2. Test core functionality
# - Add tasks with different priorities/categories
# - Test search and filtering
# - Verify mobile responsiveness
# - Check browser console for errors

# 3. Test edge cases
# - Empty inputs
# - Very long task names
# - Many tasks (100+)
# - Special characters in task text
```

## 📚 Documentation Standards

### Code Comments
```javascript
/**
 * Filters tasks based on current filter criteria
 * @param {Array} tasks - Array of task objects
 * @returns {Array} Filtered array of tasks
 */
function getFilteredTasks(tasks) {
    // Implementation details...
}
```

### README Updates
When adding features, update:
- Features list
- Screenshots (if UI changes)
- Usage instructions
- Any new dependencies

## 🎨 Design Guidelines

### Visual Design Principles
- **Consistency**: Follow established color palette and typography
- **Accessibility**: Maintain proper contrast ratios (4.5:1 minimum)
- **Simplicity**: Clean, uncluttered interface
- **Feedback**: Provide clear visual feedback for user actions

### Color Palette
```css
/* Primary Colors */
--primary-blue: #667eea;
--primary-purple: #764ba2;

/* Priority Colors */
--priority-high: #e53e3e;    /* Red */
--priority-medium: #ed8936;  /* Orange */
--priority-low: #48bb78;     /* Green */

/* Category Colors */
--category-work: #3182ce;     /* Blue */
--category-personal: #805ad5; /* Purple */
--category-shopping: #38a169; /* Green */
--category-health: #e53e3e;   /* Red */
```

### Typography Scale
- **Titles**: 2.5rem (Inter 700)
- **Headings**: 1.5rem (Inter 600)
- **Body**: 1rem (Inter 400)
- **Small**: 0.875rem (Inter 500)
- **Labels**: 0.75rem (Inter 600)

## 🚀 Release Process

### Version Numbering
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 2.1.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow
1. **Create release branch**: `release/v2.1.0`
2. **Update version numbers** in relevant files
3. **Update CHANGELOG.md** with release notes
4. **Test thoroughly** in clean environment
5. **Create GitHub release** with proper tags
6. **Merge to main** and deploy

## 👥 Community Guidelines

### Code of Conduct
Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Communication
- **Be respectful** and constructive in all interactions
- **Ask questions** if something is unclear
- **Provide context** when reporting issues or requesting features
- **Be patient** with review processes

### Getting Help
- 📖 **Documentation**: Check existing docs first
- 🐛 **Issues**: Search existing issues before creating new ones
- 💬 **Discussions**: Use GitHub Discussions for questions
- 📧 **Direct Contact**: For sensitive issues only

## 🏆 Recognition

### Contributors
All contributors are recognized in:
- README.md contributors section
- GitHub repository insights
- Release notes for significant contributions

### Contribution Types
We value all types of contributions:
- 💻 **Code**: New features, bug fixes, improvements
- 📚 **Documentation**: README, guides, comments
- 🎨 **Design**: UI/UX improvements, graphics
- 🧪 **Testing**: Test cases, bug reports, QA
- 💡 **Ideas**: Feature suggestions, improvements
- 🗣️ **Community**: Helping others, discussions

## 📋 Development Checklist

Before submitting any contribution:

### Pre-Development
- [ ] Issue exists for the work (bug report or feature request)
- [ ] Issue is approved/triaged by maintainers
- [ ] Approach discussed in issue comments
- [ ] Local development environment set up

### During Development
- [ ] Feature branch created with descriptive name
- [ ] Regular commits with conventional messages
- [ ] Code follows established style guidelines
- [ ] Changes tested manually in multiple browsers
- [ ] Documentation updated as needed

### Pre-Submission
- [ ] Self-review of all changes completed
- [ ] All automated checks passing locally
- [ ] PR template filled out completely
- [ ] Screenshots included for UI changes
- [ ] Breaking changes documented

### Post-Submission
- [ ] Address review feedback promptly
- [ ] Update PR based on suggestions
- [ ] Respond to questions and comments
- [ ] Ensure CI pipeline passes

## 🛠️ Advanced Contributing

### Working with Forks
```bash
# Keep your fork up to date
git checkout main
git pull upstream main
git push origin main

# Rebase feature branch
git checkout feature/your-feature
git rebase main
git push --force-with-lease origin feature/your-feature
```

### Handling Review Feedback
```bash
# Make requested changes
git add .
git commit -m "address review feedback: improve error handling"

# Squash commits if requested
git rebase -i HEAD~3
# Follow interactive rebase instructions
```

---

## 📞 Need Help?

If you're new to contributing to open source projects:
- 📖 [First Contributions Guide](https://github.com/firstcontributions/first-contributions)
- 📚 [GitHub Docs](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests)
- 🎓 [Git Handbook](https://guides.github.com/introduction/git-handbook/)

For TaskFlow-specific questions:
- 🐛 [Create an issue](../../issues/new)
- 💬 [Join discussions](../../discussions)
- 📧 Check repository README for contact information

---

**Thank you for contributing to TaskFlow!** 🙏

Your contributions help make TaskFlow better for everyone. We appreciate your time and effort in maintaining high standards while building an excellent task management application.

*Happy coding!* 🚀
