// ================= LOGIN VALIDATION =================
export function validateLogin(email: any, password: any) {
  if (typeof email !== "string" || typeof password !== "string") {
    return "Invalid input type";
  }

  email = email.trim();
  password = password.trim();

  if (!email || !password) {
    return "Email and password are required";
  }

  if (email.length > 100 || password.length > 50) {
    return "Input too long";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  if (password.length < 5) {
    return "Password must be at least 5 characters";
  }

  return null;
}


// ================= ADMIN CREATE / UPDATE =================
export function validateAdminCreate(data: any) {
  if (!data || typeof data !== "object") {
    return "Invalid data";
  }

  let { userFirstName, userLastName, email, password } = data;

  // trim
  userFirstName = userFirstName?.trim();
  userLastName = userLastName?.trim();
  email = email?.trim();
  password = password?.trim();

  const nameRegex = /^[A-Za-z ]+$/;

  // 🔒 First Name
  if (!userFirstName || typeof userFirstName !== "string") {
    return "First name is required";
  }

  if (userFirstName.length < 2 || userFirstName.length > 50) {
    return "First name must be between 2 and 50 characters";
  }

  if (!nameRegex.test(userFirstName)) {
    return "First name must contain only letters";
  }

  // 🔒 Last Name (optional)
  if (userLastName) {
    if (typeof userLastName !== "string") {
      return "Invalid last name";
    }

    if (userLastName.length > 50) {
      return "Last name too long";
    }

    if (!nameRegex.test(userLastName)) {
      return "Last name must contain only letters";
    }
  }

  // 🔒 Email
  if (!email || typeof email !== "string") {
    return "Email is required";
  }

  if (email.length > 100) {
    return "Email too long";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format";
  }

  // 🔒 Password (create + edit safe)
  if (password !== undefined) {
    if (typeof password !== "string") {
      return "Invalid password";
    }

    if (password.length > 50) {
      return "Password too long";
    }

    if (password.length > 0 && password.length < 6) {
      return "Password must be at least 6 characters";
    }
  }

  return null;
}