async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/stats');
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body snippet:', text.substring(0, 500));
  } catch (e) {
    console.error('Fetch Error:', e.message);
  }
}
test();
