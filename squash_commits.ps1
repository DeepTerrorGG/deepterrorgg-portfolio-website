
$env:GIT_SEQUENCE_EDITOR = "sed -i 's/^pick 3119e36/squash 3119e36/'; s/^pick 20aa5be/squash 20aa5be/'; s/^pick 45b95d2/squash 45b95d2/'; s/^pick 10b342e/squash 10b342e/'; s/^pick 6a6a272/squash 6a6a272/'; s/^pick 3b81ae7/squash 3b81ae7/') "
git rebase -i HEAD~12
