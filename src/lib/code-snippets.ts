export const snippets = {
    javascript: `function factorial(n) {
  if (n === 0) {
    return 1;
  }
  return n * factorial(n - 1);
}

console.log(factorial(5));`,
    python: `def fibonacci(n):
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()

fibonacci(1000)`,
    typescript: `interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  // In a real app, you'd fetch this from a database
  return {
    id: id,
    name: 'John Doe',
    email: 'john.doe@example.com'
  };
}`,
    rust: `fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {}", count);
        let mut remaining = 10;

        loop {
            println!("remaining = {}", remaining);
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }

        count += 1;
    }
    println!("End count = {}", count);
}`
};

export type Language = keyof typeof snippets;
