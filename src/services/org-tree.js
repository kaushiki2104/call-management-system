


export const buildUserTree = (users) => {

  const map = {};
  const roots = [];

  users.forEach(user => {
    map[user.id] = { ...user, children: [] };
  });

  users.forEach(user => {

    if (user.supervisorId) {
      map[user.supervisorId]?.children.push(map[user.id]);
    } else {
      roots.push(map[user.id]);
    }

  });

  return roots;
}