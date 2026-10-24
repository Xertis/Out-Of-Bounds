local FFI = ffi

FFI.cdef[[
    unsigned long long strtoull(const char* nptr, char** endptr, int base);
    long long strtoll(const char* nptr, char** endptr, int base);
]]

local ERANGE = 34

local this = {}

local function parse(ctype_name, signed, value, base)
    local parse_func = signed and FFI.C.strtoll or FFI.C.strtoull
    if type(base) ~= "number" then
        base = 10
    end
    if value == "" then
        error("invalid integer string: empty", 3)
    end
    local endptr = FFI.new("char*[1]")
    FFI.errno(0)
    local wide = parse_func(value, endptr, base)
    if endptr[0][0] ~= 0 then
        error(string.format("invalid integer string: %q", value), 3)
    end
    if FFI.errno() == ERANGE then
        error(string.format("integer out of range for %s: %q", ctype_name, value), 3)
    end

    if not signed and value:find("^%s*%-") and wide ~= 0 then
        error(string.format("integer out of range for %s: %q", ctype_name, value), 3)
    end
    local result = FFI.cast(ctype_name, wide)
    if FFI.sizeof(ctype_name) < 8 and tonumber(result) ~= tonumber(wide) then
        error(string.format("integer out of range for %s: %q", ctype_name, value), 3)
    end
    return result
end

local function create_integral_type(ctype_name, signed)
    return function(value, base)
        if value == nil then
            value = 0
        end
        local typename = type(value)
        if typename == "number" or typename == "cdata" then
            return FFI.cast(ctype_name, value)
        elseif typename == "string" then
            return parse(ctype_name, signed, value, base)
        end
        error(string.format("invalid value type: %s", typename), 2)
    end
end


this.uint8 = create_integral_type("uint8_t", false)
this.uint16 = create_integral_type("uint16_t", false)
this.uint32 = create_integral_type("uint32_t", false)
this.uint64 = create_integral_type("uint64_t", false)

this.int8 = create_integral_type("int8_t", true)
this.int16 = create_integral_type("int16_t", true)
this.int32 = create_integral_type("int32_t", true)
this.int64 = create_integral_type("int64_t", true)

return this
