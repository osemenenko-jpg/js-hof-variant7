// ---------- State Manager ----------

const createStore = (reducer, initialState) => {
  let state = initialState;
  let listeners = [];

  const getState = () => state;

  const dispatch = action => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
  };

  const subscribe = listener => {
    listeners.push(listener);
  };

  return { getState, dispatch, subscribe };
};

// ---------- Actions ----------

const ADD = 'ADD';
const TOGGLE = 'TOGGLE';
const DELETE = 'DELETE';
const SET_FILTER = 'SET_FILTER';

// ---------- Reducer ----------

const reducer = (state, action) => {
  switch (action.type) {
    case ADD:
      return {
        ...state,
        todos: [...state.todos, action.payload]
      };

    case TOGGLE:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };

    case DELETE:
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };

    case SET_FILTER:
      return {
        ...state,
        filter: action.payload
      };

    default:
      return state;
  }
};

// ---------- Initial State ----------

const initialState = {
  todos: [],
  filter: 'all'
};

const store = createStore(reducer, initialState);

// ---------- UI ----------

const form = document.getElementById('todoForm');
const input = document.getElementById('todoInput');
const list = document.getElementById('todoList');
const total = document.getElementById('totalCount');
const completed = document.getElementById('completedCount');
const buttons = document.querySelectorAll('[data-filter]');

// ---------- Render ----------

const render = () => {
  const state = store.getState();

  let todos = state.todos;

  if (state.filter === 'active') {
    todos = todos.filter(t => !t.completed);
  }

  if (state.filter === 'completed') {
    todos = todos.filter(t => t.completed);
  }

  list.innerHTML = todos
    .map(
      t => `
      <li class="${t.completed ? 'completed' : ''}">
        ${t.text}
        <div>
          <button onclick="toggle(${t.id})">✔</button>
          <button onclick="removeTodo(${t.id})">✖</button>
        </div>
      </li>
    `
    )
    .join('');

  total.textContent = 'Всього: ' + state.todos.length;
  completed.textContent =
    'Виконано: ' + state.todos.filter(t => t.completed).length;
};

store.subscribe(render);
render();

// ---------- Handlers ----------

form.addEventListener('submit', e => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  store.dispatch({
    type: ADD,
    payload: {
      id: Date.now(),
      text,
      completed: false
    }
  });

  input.value = '';
});

window.toggle = id => {
  store.dispatch({ type: TOGGLE, payload: id });
};

window.removeTodo = id => {
  store.dispatch({ type: DELETE, payload: id });
};

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    store.dispatch({
      type: SET_FILTER,
      payload: btn.dataset.filter
    });
  });
});