function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    <TodoListCard />
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard() {
    const [items, setItems] = React.useState(null);
    const [priorityFilter, setPriorityFilter] = React.useState(''); // Set default priority level filter to empty string (All)
    const [categoryFilter, setCategoryFilter] = React.useState(''); // Set default category filter to empty string (All)

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    const onPriorityFilterChange = React.useCallback(
        event => {
            setPriorityFilter(event.target.value);
        }
    );

    const onCategoryFilterChange = React.useCallback(
        event => {
            setCategoryFilter(event.target.value);
        }
    );

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [items],
    );

    if (items === null) return 'Loading...';

    return (
        <React.Fragment>
            <PriorityFilterForm
                priorityFilter={priorityFilter}
                onPriorityFilterChange={onPriorityFilterChange}
            />
            <CategoryFilterForm
                categoryFilter={categoryFilter}
                onCategoryFilterChange={onCategoryFilterChange}
            />
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">You have no todo items yet! Add one above!</p>
            )}
            {items.filter(item => 
                (priorityFilter === '' || item.priority === priorityFilter) &&
                (categoryFilter === '' || item.category === categoryFilter)
            ).map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </React.Fragment>
    );
}

function PriorityFilterForm(props) {
    return (
        <div>
            <label htmlFor="priorityFilter">Filter by Priority: </label>
            <select id="priorityFilter" value={props.priorityFilter} onChange={props.onPriorityFilterChange}>
                <option value="">All</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
            </select>
        </div>
    );
}

function CategoryFilterForm(props) {
    return (
        <div>
            <label htmlFor="categoryFilter">Filter by Category: </label>
            <input id="categoryFilter" value={props.categoryFilter} onChange={props.onCategoryFilterChange} />
        </div>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [selected, setSelected] = React.useState('1'); // Set default value for priority level as 1 (low)
    const [submitting, setSubmitting] = React.useState(false);
    const [category, setCategory] = React.useState('');
    const [dueDate, setDueDate] = React.useState(''); 

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem, priority: selected, category: category, due_date: dueDate }), // Add priority level to JSON submission and including category
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
                setCategory('');
                setDueDate('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                {/* <InputGroup.Prepend> */}
                    <Form.Control
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        type="text"
                        placeholder="Category"
                        aria-describedby="basic-addon1"
                        className="mr-1"
                    />
                {/* </InputGroup.Prepend> */}
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                    className="mr-1"
                />
                <InputGroup.Append>
                    <select onChange={event => setSelected(event.target.value)} autoFocus={true}> // Dropdown menu used to select priority level
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                    </select>
                </InputGroup.Append> 
                <Form.Control
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    placeholder="Due Date"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add Item'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
   
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
                priority: item.priority
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    return (
        <Container fluid className={`item ${item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={5} className="name">
                    {item.name}
                </Col>

                {/* <Col xs={5} className="priority">
                    {item.priority}
                </Col> */}
                {/* The following lines define different display cases depending on the priority level chosen */}
                {item.priority == 1 &&
                    <Col xs={5} className="priority">
                        Priority:
                        <svg height="30" width="30">
                            <circle r="5" cx="15" cy="15" fill="green" />
                        </svg>
                    </Col>
                }
                {item.priority == 2 &&
                    <Col xs={5} className="priority">
                        Priority:
                        <svg height="30" width="30">
                            <circle r="5" cx="15" cy="15" fill="goldenrod" />
                        </svg>
                    </Col>
                }
                {item.priority == 3 &&
                    <Col xs={5} className="priority">
                        Priority:
                        <svg height="30" width="30">
                            <circle r="5" cx="15" cy="15" fill="red" />
                        </svg>
                    </Col>
                }
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>  
            </Row>
            <Row>
                <Col xs={12} className="category text-muted">
                    Category: {item.category}
                </Col>
                <Col xs={12} className="due-date text-muted">
                    Due Date: {item.due_date}
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
