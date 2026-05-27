import { auth, db } from './firebase-config.js';

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTableBody');
const searchInput = document.getElementById('searchInput');


// CREATE USER

userForm.addEventListener('submit', async (e) => {

  e.preventDefault();

  const employeeId = document.getElementById('employeeId').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const defaultPassword = document.getElementById('defaultPassword').value;
  const department = document.getElementById('department').value;
  const role = document.getElementById('role').value;
  const active = document.getElementById('active').value === 'true';

  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        defaultPassword
      );

    const uid = userCredential.user.uid;

    await setDoc(doc(db, 'users', uid), {

      employeeId,
      name,
      email,
      department,
      role,
      active,
      defaultPassword,
      createdAt: new Date()

    });

    alert('User Created Successfully');

    userForm.reset();

    loadUsers();

  } catch (error) {

    console.error(error);
    alert(error.message);

  }

});



// LOAD USERS

async function loadUsers() {

  userTableBody.innerHTML = '';

  const querySnapshot =
    await getDocs(collection(db, 'users'));

  querySnapshot.forEach((docSnap) => {

    const user = docSnap.data();

    const row = `
      <tr>

        <td>${user.employeeId}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.department}</td>
        <td>${user.role}</td>

        <td>
          ${user.active ? 'Active' : 'Inactive'}
        </td>

        <td>

          <button
            class="btn btn-warning btn-sm"
            onclick="editUser('${docSnap.id}')"
          >
            Edit
          </button>

          <button
            class="btn btn-danger btn-sm"
            onclick="deleteUser('${docSnap.id}')"
          >
            Delete
          </button>

        </td>

      </tr>
    `;

    userTableBody.innerHTML += row;

  });

}

loadUsers();



// DELETE USER

window.deleteUser = async function(id) {

  const confirmDelete =
    confirm('Delete User ?');

  if (!confirmDelete) return;

  await deleteDoc(doc(db, 'users', id));

  alert('User Deleted');

  loadUsers();

}



// EDIT USER

window.editUser = async function(id) {

  const newDepartment =
    prompt('Enter New Department');

  if (!newDepartment) return;

  await updateDoc(doc(db, 'users', id), {

    department: newDepartment

  });

  alert('User Updated');

  loadUsers();

}



// SEARCH USER

searchInput.addEventListener('keyup', () => {

  const filter =
    searchInput.value.toLowerCase();

  const rows =
    userTableBody.getElementsByTagName('tr');

  for (let i = 0; i < rows.length; i++) {

    const text =
      rows[i].innerText.toLowerCase();

    rows[i].style.display =
      text.includes(filter)
      ? ''
      : 'none';

  }

});
