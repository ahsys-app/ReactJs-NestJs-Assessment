import Select from "react-select";

const formatOptionLabel = ({ value, label }) => (
    <div className={'custom-select'} style={{ display: "flex" }}>
        { value && <div><img src={require('../assets/images/'+value+'.png')} alt={value}/></div> }
        { label ? <div className={'custom-select-text'}>{label}</div> : 'Select' }

    </div>
);

const CustomSelect = ({ options, defaultValue, onChange }) => {
    return (
        options !== null && options?.length > 0 &&
        <Select
            defaultValue={defaultValue}
            formatOptionLabel={formatOptionLabel}
            options={options}
            onChange={onChange}
        />
    );
}

export default CustomSelect;