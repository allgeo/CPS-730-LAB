const PRIORITY_COLOURS = {  1: 'green',
                            2: 'goldenrod',
                            3: 'red'   };

function App() {
    const { Container, Row, Col } = ReactBootstrap;

    const [priorityFilter, setPriorityFilter] = React.useState(0);
    const [categoryFilter, setCategoryFilter] = React.useState('');

    return (
        <Container fluid>      
            <Row>
                <Col sm={{ offset: 1, span: 2 }}>
                    <FilterForm 
                        priorityFilter={priorityFilter} 
                        setPriorityFilter={setPriorityFilter}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                    />
                </Col>
                <Col sm={{ offset: 1, span: 5 }}>
                    <TodoListCard 
                        priorityFilter={priorityFilter}
                        categoryFilter={categoryFilter}
                    />
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard(props) {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        item => {
            setItems(items.map(i => i.id === item.id ? item : i));
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            setItems(items.filter(i => i.id !== item.id));
        },
        [items],
    );

    const applyFilters = (item) => 
        (props.priorityFilter === 0 || item.priority === props.priorityFilter) &&
        (props.categoryFilter === '' || item.category === props.categoryFilter);


    if (items === null) return 'Loading...';

    return (
        <React.Fragment>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
                <p className="text-center">You have no todo items yet! Add one above!</p>
            )}
            {items
                .filter(applyFilters)
                .map(item => 
            (
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

function FilterForm(props) {
    const { Form, Button, Row, Col } = ReactBootstrap;

    const [priorityFilter, setPriorityFilter] = React.useState(props.priorityFilter);
    const [categoryFilter, setCategoryFilter] = React.useState(props.categoryFilter);

    const onPriorityFilterChange = (event) => {
        setPriorityFilter(parseInt(event.target.value, 10));
    };

    const onCategoryFilterChange = (event) => {
        setCategoryFilter(event.target.value);
    };

    const onApplyFilters = (event) => {
        event.preventDefault();
        props.setPriorityFilter(priorityFilter);
        props.setCategoryFilter(categoryFilter);
    };

    const onClearFilters = (event) => {
        event.preventDefault();
        setPriorityFilter(0);
        setCategoryFilter('');
        props.setPriorityFilter(0);
        props.setCategoryFilter('');
    }

    const checkIfFiltersSelected = () => {
        return (priorityFilter !== props.priorityFilter || categoryFilter !== props.categoryFilter);
    }

    return (
        <Form onSubmit={onApplyFilters}>
            <h4>Filter By:</h4>
            <Form.Group as={Row}>
                <Form.Label column sm="4" htmlFor="priorityFilter">Priority: </Form.Label>
                <Col sm="8">
                    <Form.Control as="select" id="priorityFilter" value={priorityFilter} onChange={onPriorityFilterChange}>
                        <option value={0}>All</option>
                        <option value={1}>Low</option>
                        <option value={2}>Medium</option>
                        <option value={3}>High</option>
                    </Form.Control>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column sm="4" htmlFor="categoryFilter">Category: </Form.Label>
                <Col sm="8">
                    <Form.Control 
                        type="text" 
                        id="categoryFilter" 
                        value={categoryFilter}
                        onChange={onCategoryFilterChange}>
                    </Form.Control>
                </Col>
            </Form.Group>
            <Row>
                <Col sm={{ offset: 4 }}>
                    <Button type="submit" className="mr-3" disabled={!checkIfFiltersSelected()}>Apply</Button>
                    {(props.priorityFilter !== 0 || props.categoryFilter !== '') &&
                    <Button
                        size="sm"
                        variant="link"
                        onClick={onClearFilters}
                        aria-label="Clear Filters"
                        >
                        
                        <i className="fa fa-trash fa-lg" style={{ color: 'grey' }}/>
                    </Button>}
                </Col>
            </Row>
        </Form>
    );
}

// function SortForm() {
//     const [nameSort, setNameSort] = React.useState('');
//     const [prioritySort, setPrioritySort] = React.useState('');
//     const [dueDateSort, setDueDateSort] = React.useState('');
// }

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button, OverlayTrigger, Tooltip } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [priority, setPriority] = React.useState(1); // Set default value for priority level as 1 (low)
    const [submitting, setSubmitting] = React.useState(false);
    const [category, setCategory] = React.useState('');
    const [dueDate, setDueDate] = React.useState('');

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem, priority: priority, category: category, due_date: dueDate }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
                setCategory('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-1">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                    className="mr-1"
                ></Form.Control>
            </InputGroup>
            <InputGroup className="mb-3">
                <Form.Control
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    type="text"
                    placeholder="Category"
                    aria-describedby="basic-addon1"
                    className="mr-1"
                ></Form.Control>
                <OverlayTrigger
                    overlay={<Tooltip id="tooltip-priority">Select the priority level</Tooltip>}
                    >
                    <Form.Control
                        as="select"
                        value={priority}
                        onChange={e => setPriority(parseInt(e.target.value, 10))}
                        className="mr-1"
                    >
                        <option value={1}>Low</option>
                        <option value={2}>Medium</option>
                        <option value={3}>High</option>
                    </Form.Control>
                </OverlayTrigger>
                <OverlayTrigger 
                    overlay={<Tooltip id="tooltip-due-date">Select the due date</Tooltip>}
                    >
                    <Form.Control
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        className="mr-1"
                        min={new Date().toISOString().split('T')[0]}
                    ></Form.Control>
                </OverlayTrigger>
                <Button
                    type="submit"
                    variant="success"
                    disabled={!newItem.length}
                    className={submitting ? 'disabled' : ''}
                >
                    {submitting ? 'Adding...' : 'Add Item'}
                </Button>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button, OverlayTrigger, Tooltip } = ReactBootstrap;

    const calculateDays = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const timeDiff = due.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff;
    }

    const [days, setDays] = React.useState(calculateDays(item.due_date));

    React.useEffect(() => {
        const timer = setInterval(() => {
            setDays(calculateDays(item.due_date));
        }, 1000 * 3600 * 24); // update every 24 hours

        // Clear interval on component unmount
        return () => clearInterval(timer);
    }, [item.due_date]);

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
                priority: item.priority,
                category: item.category,
                due_date: item.due_date
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
                <Col xs={5} className="name text-truncate">
                    <OverlayTrigger
                        overlay={<Tooltip id={"tooltip-item-name"}>Item Name: {item.name}</Tooltip>}
                        >
                        <span>{item.name}</span>
                    </OverlayTrigger>
                </Col>
                <Col xs={5} className="category text-muted text-truncate">
                    <OverlayTrigger
                        overlay={<Tooltip id={"tooltip-category"}>Category: {item.category}</Tooltip>}
                        >
                        <span>Category: {item.category}</span>
                    </OverlayTrigger>
                </Col>
                <Col xs={1} className="text-center remove">
                    <OverlayTrigger
                        overlay={<Tooltip id={"tooltip-remove-item"}>Remove Item</Tooltip>}
                        >
                        <Button
                            size="sm"
                            variant="link"
                            onClick={removeItem}
                            aria-label="Remove Item"
                            className="mt-2"
                            >
                            <i className="fa fa-trash fa-lg text-danger" />
                        </Button>
                    </OverlayTrigger>
                </Col> 
            </Row>
            <Row>
                <Col xs={6} className="due-date text-muted">
                    {isNaN(days) ? 'No Due Date' : `Due In:  ${days} Days`}
                </Col>
                <Col xs={6} className="priority text-muted">
                    Priority Level:
                    <svg height="30" width="30">
                        <circle r="5" cx="15" cy="15" fill={PRIORITY_COLOURS[item.priority]} />
                    </svg>
                </Col>
            </Row>
        </Container>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));