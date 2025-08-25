// Tree.js
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.parent = null;
  }

  addChild(value, direction)
  {
    this[direction] = new Node(value)
    this[direction].parent = this
  }
}

class Tree {
  constructor(value) {
    this.root = new Node(value);
  }

  size(node) {
    if (!node) return 0;
    return 1 + this.size(node.left) + this.size(node.right);
  }

  delete(value) {
    this.root = this._deleteRecursive(this.root, value);
    this.root = this._balance(this.root);
    if (this.root) this.root.parent = null;
  }

  _deleteRecursive(node, value) {
    if (!node) return null;
    if (value < node.value) {
      node.left = this._deleteRecursive(node.left, value);
      if (node.left) node.left.parent = node;
    } else if (value > node.value) {
      node.right = this._deleteRecursive(node.right, value);
      if (node.right) node.right.parent = node;
    } else {
      if (!node.left) {
        const right = node.right;
        if (right) right.parent = node.parent;
        return right;
      }
      if (!node.right) {
        const left = node.left;
        if (left) left.parent = node.parent;
        return left;
      }
      let successor = this._findMin(node.right);
      node.value = successor.value;
      node.right = this._deleteRecursive(node.right, successor.value);
      if (node.right) node.right.parent = node;
    }
    return node;
  }

  _findMin(node) {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }

  balance() {
    this.root = this._balance(this.root);
    if (this.root) this.root.parent = null;
    console.log('After balance, root:', this.root ? this.root.value : null);
  }

  _balance(node) {
    if (!node) return node;
    let leftSize = this.size(node.left);
    let rightSize = this.size(node.right);
    console.log('Balancing node:', node.value, 'leftSize:', leftSize, 'rightSize:', rightSize);
    if (Math.abs(leftSize - rightSize) > 1) {
      if (leftSize > rightSize) {
        let leftLeftSize = this.size(node.left?.left);
        let leftRightSize = this.size(node.left?.right);
        if (leftLeftSize >= leftRightSize) {
          node = this._rotateRight(node);
        } else {
          node.left = this._rotateLeft(node.left);
          if (node.left) node.left.parent = node;
          node = this._rotateRight(node);
        }
      } else {
        let rightRightSize = this.size(node.right?.right);
        let rightLeftSize = this.size(node.right?.left);
        if (rightRightSize >= rightLeftSize) {
          node = this._rotateLeft(node);
        } else {
          node.right = this._rotateRight(node.right);
          if (node.right) node.right.parent = node;
          node = this._rotateLeft(node);
        }
      }
    }
    node.left = this._balance(node.left);
    if (node.left) node.left.parent = node;
    node.right = this._balance(node.right);
    if (node.right) node.right.parent = node;
    console.log('Balanced node:', node.value, 'tree:', this.getSorted());
    return node;
  }

  _rotateRight(node) {
    if (!node || !node.left) return node;
    let newRoot = node.left;
    node.left = newRoot.right;
    if (node.left) node.left.parent = node;
    newRoot.right = node;
    node.parent = newRoot;
    newRoot.parent = null;
    console.log('Rotate right, new root:', newRoot.value);
    return newRoot;
  }

  _rotateLeft(node) {
    if (!node || !node.right) return node;
    let newRoot = node.right;
    node.right = newRoot.left;
    if (node.right) node.right.parent = node;
    newRoot.left = node;
    node.parent = newRoot;
    newRoot.parent = null;
    console.log('Rotate left, new root:', newRoot.value);
    return newRoot;
  }

  getSorted() {
    const result = [];
    this._getSortedRecursive(this.root, result);
    console.log('Getting sorted list, root:', this.root ? this.root.value : null, 'result:', result);
    return result;
  }

  _getSortedRecursive(node, result = []) {
    if (node) {
      this._getSortedRecursive(node.left, result);
      result.push(node.value);
      this._getSortedRecursive(node.right, result);
    }
    return result;
  }

  inorder() {
    this._inorderRecursive(this.root);
  }

  _inorderRecursive(node, level = 0, prefix = '') {
    if (node) {
      this._inorderRecursive(node.left, level + 1, '/');
      console.log('  '.repeat(level) + prefix + `${node.value} (L:${this.size(node.left)}, R:${this.size(node.right)})`);
      this._inorderRecursive(node.right, level + 1, '\\');
    }
  }
}

export { Node, Tree };