
# User Guide

Complete guide to using ETLP Data Mapping Studio for creating and managing data transformations.

## Overview

ETLP Data Mapping Studio provides a visual interface for creating data transformation mappings using Jute.clj. This guide covers all features and workflows available in the application.

## Getting Started

### Navigation

The application uses a sidebar navigation with the following main sections:
- **Mappings List**: View and manage all your data mappings
- **Create Mapping**: Create new transformation mappings
- **Mapping Editor**: Edit individual mappings with live preview

### Main Workflow

1. **Create** a new mapping with title and tags
2. **Design** transformation rules using YAML syntax
3. **Test** with sample data to validate results
4. **Save** and manage versions of your mappings

## Creating Mappings

### Basic Mapping Creation

1. Click "Create New Mapping" from the main interface
2. Enter a descriptive title (e.g., "Customer Data Normalization")
3. Add relevant tags for organization:
   - Type tags and press Enter to add them
   - Use tags like "customers", "api", "normalization"
4. Click "Create Mapping"

### Mapping Configuration

Once created, you can configure your mapping with:
- **Title**: Descriptive name for your transformation
- **Tags**: Organizational labels for filtering and searching
- **YAML Rules**: Jute.clj transformation logic
- **Test Data**: Sample inputs for validation

## Working with Transformation Rules

### YAML Editor

The built-in YAML editor provides:
- **Syntax Highlighting**: Clear visual distinction of YAML elements
- **Auto-completion**: Suggestions for common Jute.clj patterns
- **Error Detection**: Real-time validation of YAML syntax
- **Auto-save**: Changes are saved automatically

### Basic Transformation Patterns

**Field Mapping**:
```yaml
transform:
  - field: "full_name"
    from: "$.name"
```

**Field Concatenation**:
```yaml
transform:
  - field: "display_name" 
    concat:
      - "$.firstName"
      - " "
      - "$.lastName"
```

**Conditional Transformations**:
```yaml
transform:
  - field: "status"
    when: "$.active == true"
    value: "ACTIVE"
  - field: "status"
    when: "$.active == false"
    value: "INACTIVE"
```

**Data Type Conversions**:
```yaml
transform:
  - field: "age"
    from: "$.age"
    type: "integer"
  - field: "created_date"
    from: "$.timestamp"
    type: "date"
    format: "ISO8601"
```

## Testing Transformations

### Adding Sample Data

1. Click "Add Sample Data" in the editor
2. Choose data format (JSON recommended)
3. Enter your test data:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "age": "25",
  "active": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

4. Save the sample data

### Running Tests

1. With sample data loaded, click "Test Transform"
2. Review the output in the preview panel
3. Verify the transformation matches your expectations
4. Adjust YAML rules if needed and re-test

### Multiple Test Cases

You can create multiple sample datasets:
- Click "Add New Sample" for additional test cases
- Name your samples descriptively (e.g., "Valid User", "Missing Fields")
- Test edge cases and validation scenarios

## Managing Sample Data

### Data Formats

**JSON Format** (Recommended):
```json
{
  "user_id": 123,
  "email": "user@example.com",
  "preferences": {
    "notifications": true,
    "theme": "dark"
  }
}
```

**YAML Format**:
```yaml
user_id: 123
email: user@example.com
preferences:
  notifications: true
  theme: dark
```

### Best Practices

- **Representative Data**: Use realistic sample data that represents your actual use cases
- **Edge Cases**: Include samples with missing fields, null values, and boundary conditions
- **Multiple Scenarios**: Test both successful transformations and error conditions
- **Data Privacy**: Use anonymized or synthetic data for testing

## Version History

### Tracking Changes

The system automatically tracks:
- **Timestamps**: When changes were made
- **Content Changes**: What was modified in the mapping
- **Version Numbers**: Sequential versioning of your mappings

### Viewing History

1. Navigate to a mapping
2. Click "View History" 
3. Browse previous versions
4. Compare changes between versions

### Reverting Changes

1. In the history view, select a previous version
2. Click "Restore This Version"
3. Confirm the restoration
4. The mapping will be reverted to the selected state

## Advanced Features

### Tag Management

- **Filtering**: Use tags to filter mappings in the list view
- **Organization**: Group related mappings with consistent tagging
- **Search**: Tags are searchable for quick navigation

### Bulk Operations

- **Export**: Download mappings as YAML files
- **Import**: Upload YAML mappings from external sources
- **Clone**: Duplicate existing mappings as starting points

### Collaboration

- **Sharing**: Share mapping URLs with team members
- **Comments**: Add notes and documentation within mappings
- **Status Tracking**: Mark mappings as draft, testing, or production

## Troubleshooting

### Common Issues

**YAML Syntax Errors**:
- Check indentation (use spaces, not tabs)
- Verify proper YAML structure
- Use the syntax highlighting to identify issues

**Transformation Not Working**:
- Verify field paths in your sample data
- Check Jute.clj syntax for transformations
- Test with simpler sample data first

**Sample Data Format Issues**:
- Ensure valid JSON/YAML format
- Check for proper escaping of special characters
- Verify data types match expectations

### Performance Tips

- **Large Datasets**: Use smaller, representative samples for testing
- **Complex Transformations**: Break down into simpler, testable components
- **Frequent Saves**: The auto-save feature prevents data loss

## Integration with ETLP

### Data Pipeline Integration

Your mappings integrate with ETLP data pipelines:
- **Source Processors**: Define how data enters the transformation
- **Transformation Layer**: Your YAML rules execute here
- **Destination Processors**: Configure where transformed data goes

### Production Deployment

1. **Test Thoroughly**: Validate with comprehensive sample data
2. **Export Configuration**: Download your mapping configuration
3. **Deploy to ETLP**: Integrate with your ETLP data pipeline
4. **Monitor**: Track transformation performance and errors

For detailed integration steps, see the [API Integration Guide](api-integration.md).
