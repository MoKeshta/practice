const people = [
  { name: "Ali", age: 25, city: "Cairo" },
  { name: "Sara", age: 17, city: "Alexandria" },
  { name: "Omar", age: 32, city: "Cairo" },
  { name: "Mona", age: 28, city: "Giza" },
];

// 1. Get an array of just the names (use map)

// 2. Get only the people aged 18 or older (use filter)

// 3. Find the person named "Omar" (use find)

// 4. Calculate the total of all ages (use reduce)

// 5. Using destructuring, print the name and city of the first person

// 6. Write a function getPerson(name) that returns a Promise.
//    After 1 second it resolves with the matching person, or rejects with "Not found".
//    Then call it using async/await inside try/catch.
const names = people.map((person) => person.name);
console.log(names); 
const adults=people.filter((person) => person.age > 18);
console.log(adults);
const omar = people.find((person) => person.name === "Omar");
console.log(omar);
const totalAge = people.reduce((sum,person) => sum + person.age, 0);
console.log(totalAge);
const average= totalAge/people.length;
console.log(average);

// 5
const { name, city } = people[0];
console.log(name, city);

// 6
function getPerson(searchName) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const person = people.find((p) => p.name === searchName);

      if (person) {
        resolve(person);
      } else {
        reject("Not found");
      }
    }, 1000);
  });
}

async function main() {
  try {
    const person = await getPerson("Ali");
    console.log(person);
  } catch (error) {
    console.log("Error:", error);
  }
}

main();